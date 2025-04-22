from datetime import UTC, date, datetime
from decimal import ROUND_HALF_UP, Decimal
from typing import Any, Literal

from beanie import PydanticObjectId

from src.models import BankTransaction, Transaction, TransactionType
from src.schemas.base import TransactionPublic


def round_decimal(value: Decimal) -> Decimal:
    """Rounds Decimal to 2 decimal places"""
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_percent(amount: Decimal, total: Decimal) -> Decimal:
    """Calculates percentage of total amount"""
    if total == Decimal("0"):
        return Decimal("0")
    return round_decimal((amount / total) * Decimal("100"))


def to_decimal(value: Any) -> Decimal:
    return Decimal(str(value))


def sum_amounts(transactions: list[dict[str, Any]]) -> Decimal:
    return sum((to_decimal(t["amount"]) for t in transactions), start=Decimal("0"))


def to_datetime(d: date | datetime) -> datetime:
    """Converts date to datetime if needed"""
    if isinstance(d, date) and not isinstance(d, datetime):
        return datetime.combine(d, datetime.min.time(), tzinfo=UTC)
    return d


async def get_paginated_transactions_for_user(
    user_id: PydanticObjectId,
    source_filter: Literal["manual", "plaid"] | None = None,
    transaction_type: TransactionType | None = None,
    limit: int = 20,
    offset: int = 0,
) -> dict[str, Any]:
    manual_data: list[dict[str, Any]] = []
    plaid_data: list[dict[str, Any]] = []

    if source_filter == "manual":
        base_query = Transaction.find(Transaction.user_id == user_id)
        if transaction_type:
            base_query = base_query.find(Transaction.type == transaction_type)

        total = await base_query.count()
        manual = await base_query.sort("-date").skip(offset).limit(limit).to_list()
        manual_data = [
            TransactionPublic(**txn.model_dump(exclude_none=True)).model_dump()
            | {"source": "manual"}
            for txn in manual
        ]

        return {
            "items": manual_data,
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_next": offset + len(manual_data) < total,
        }

    if source_filter == "plaid":
        base_query = BankTransaction.find(BankTransaction.user_id == user_id)
        plaid_all = await base_query.sort("-date").to_list()

        plaid_data_filtered = [
            TransactionPublic(
                id=txn.id if txn.id else PydanticObjectId(),
                user_id=txn.user_id,
                amount=Decimal(str(txn.amount)),
                type=TransactionType.INCOME if txn.amount < 0 else TransactionType.EXPENSE,
                category=", ".join(txn.category) if txn.category else None,
                payment_method=txn.payment_method,
                date=datetime.combine(txn.date, datetime.min.time(), tzinfo=UTC),
                description=txn.name,
                source="plaid",
            ).model_dump()
            for txn in plaid_all
            if transaction_type is None
            or ("income" if txn.amount < 0 else "expense") == transaction_type
        ]

        total = len(plaid_data_filtered)
        paginated = plaid_data_filtered[offset : offset + limit]

        return {
            "items": paginated,
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_next": offset + len(paginated) < total,
        }

    # If no source filter or both sources
    manual = await Transaction.find(Transaction.user_id == user_id).to_list()
    plaid = await BankTransaction.find(BankTransaction.user_id == user_id).to_list()

    manual_data = [
        TransactionPublic(**txn.model_dump(exclude_none=True)).model_dump() | {"source": "manual"}
        for txn in manual
        if transaction_type is None or txn.type == transaction_type
    ]

    plaid_data = [
        TransactionPublic(
            id=txn.id if txn.id else PydanticObjectId(),
            user_id=txn.user_id,
            amount=Decimal(str(txn.amount)),
            type=TransactionType.INCOME if txn.amount < 0 else TransactionType.EXPENSE,
            category=", ".join(txn.category) if txn.category else None,
            payment_method=txn.payment_method,
            date=datetime.combine(txn.date, datetime.min.time(), tzinfo=UTC),
            description=txn.name,
            source="plaid",
        ).model_dump()
        for txn in plaid
        if transaction_type is None
        or ("income" if txn.amount < 0 else "expense") == transaction_type
    ]

    all_txns = manual_data + plaid_data
    # Convert all dates to datetime before sorting
    all_txns.sort(key=lambda x: to_datetime(x["date"]), reverse=True)
    total = len(all_txns)
    paginated = all_txns[offset : offset + limit]

    return {
        "items": paginated,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_next": offset + len(paginated) < total,
    }


async def get_all_transactions_for_user(user_id: PydanticObjectId) -> list[dict[str, Any]]:
    """
    Returns all user transactions without pagination (needed for analytics).
    """
    result = await get_paginated_transactions_for_user(user_id=user_id, limit=10_000_000)
    return result["items"]
