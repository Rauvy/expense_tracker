from typing import Annotated, Any, Literal

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from src.auth.dependencies import get_current_user
from src.models import Transaction, TransactionType, User
from src.schemas.base import PaginatedTransactionsResponse, TransactionCreate, TransactionPublic
from src.utils.analytics_helper import get_paginated_transactions_for_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_in: TransactionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> TransactionPublic:
    """
    Create a new transaction (expense or income)
    """
    if not current_user.id:
        raise HTTPException(status_code=400, detail="User ID is required")

    # Create transaction object
    transaction = Transaction(
        **transaction_in.model_dump(), user_id=PydanticObjectId(current_user.id)
    )

    _ = await transaction.insert()  # Save to MongoDB

    # Update user balance
    if transaction.type == TransactionType.EXPENSE:
        current_user.balance -= transaction.amount
    else:  # income
        current_user.balance += transaction.amount

    _ = await current_user.save()

    return TransactionPublic(**transaction.model_dump())


@router.get(
    "/all",
)
async def get_all_transactions(
    current_user: Annotated[User, Depends(get_current_user)],
    source_filter: Annotated[Literal["manual", "plaid"] | None, Query] = None,
    transaction_type: Annotated[TransactionType | None, Query] = None,
    limit: Annotated[int, Query] = 20,
    offset: Annotated[int, Query] = 0,
) -> PaginatedTransactionsResponse:
    """
    🔄 Get all transactions (manual and bank) with pagination and filters:
    - by source (manual / plaid)
    - by transaction type (income / expense)
    """
    if not current_user.id:
        raise HTTPException(status_code=400, detail="User ID is missing")

    result = await get_paginated_transactions_for_user(
        user_id=current_user.id,
        source_filter=source_filter,
        transaction_type=transaction_type,
        limit=limit,
        offset=offset,
    )
    return PaginatedTransactionsResponse(**result)


@router.get("/{transaction_id}")
async def get_transaction_by_id(
    transaction_id: PydanticObjectId,
    current_user: Annotated[User, Depends(get_current_user)],
) -> TransactionPublic:
    """
    Get transaction by ID
    """
    transaction = await Transaction.get(transaction_id)

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this transaction")

    return TransactionPublic(**transaction.model_dump())


@router.put("/{transaction_id}")
async def update_transaction(
    transaction_id: PydanticObjectId,
    transaction_in: TransactionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, str]:
    """
    Update transaction
    """
    transaction = await Transaction.get(transaction_id)

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this transaction")

    # Update user balance
    if transaction.type == TransactionType.EXPENSE:
        current_user.balance += transaction.amount  # Return old amount
    else:  # income
        current_user.balance -= transaction.amount  # Return old amount

    # Apply new amount
    if transaction_in.type == TransactionType.EXPENSE:
        current_user.balance -= transaction_in.amount
    else:  # income
        current_user.balance += transaction_in.amount

    _ = await current_user.save()

    # Update transaction fields
    transaction.type = transaction_in.type
    transaction.amount = transaction_in.amount
    transaction.category = transaction_in.category
    transaction.payment_method = transaction_in.payment_method
    transaction.description = transaction_in.description

    if transaction_in.date:
        transaction.date = transaction_in.date

    _ = await transaction.save()

    return {"message": "Transaction updated successfully"}


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: PydanticObjectId,
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, str]:
    """
    Delete transaction
    """
    transaction = await Transaction.get(transaction_id)

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this transaction")

    # Update user balance
    if transaction.type == TransactionType.EXPENSE:
        current_user.balance += transaction.amount  # Return expense amount
    else:  # income
        current_user.balance -= transaction.amount  # Return income amount

    _ = await current_user.save()

    # Delete transaction
    _ = await transaction.delete()

    return {"message": "Transaction deleted successfully"}
