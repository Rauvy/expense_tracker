from datetime import UTC, date, datetime  # Import UTC and datetime for working with time
from decimal import Decimal  # Add Decimal import
from enum import StrEnum
from typing import Any, ClassVar, Literal, override

from beanie import (  # Document — model for MongoDB, PydanticObjectId — ID
    Document,
    PydanticObjectId,
)
from pydantic import (  # EmailStr — email validation, Field — for setting default values
    EmailStr,
    Field,
    field_validator,
)

from src.utils.mongo_types import convert_decimal128


class User(Document):
    email: EmailStr  # Required email field, automatically validated
    first_name: str  # User's first name (required)
    last_name: str  # User's last name (required)
    birth_date: datetime | None = None  # Birth date
    hashed_password: str | None = None  # Password in encrypted form, can be None for OAuth
    google_id: str | None = (
        None  # User's Google ID, can be None for regular registration
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC)
    )  # 🕓 Automatic registration time

    balance: Decimal = Field(default=Decimal("0.00"))

    @field_validator("balance", mode="before")
    @classmethod
    def validate_balance(cls, v: Any) -> Decimal:
        return convert_decimal128(v)

    @override
    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        data = super().model_dump(*args, **kwargs)
        if "balance" in data:
            data["balance"] = float(data["balance"])
        return data

    class Settings:
        name = "users"  # Collection name in MongoDB
        indexes: ClassVar[list[str]] = [
            "email",  # For quick search by email during login
            "google_id",  # For quick search of Google users
        ]
        json_encoders: ClassVar[dict[type, Any]] = {Decimal: float}


class TransactionType(StrEnum):
    EXPENSE = "expense"
    INCOME = "income"


class Transaction(Document):
    """
    Model for storing both expenses and income
    """

    user_id: PydanticObjectId  # User ID
    amount: Decimal  # Transaction amount
    source: Literal["manual", "plaid"] = "manual"
    type: TransactionType  # Type: expense or income
    category: str | None = None  # Category (e.g., "Food", "Salary")
    payment_method: str | None = None  # Payment method (for expenses)
    date: datetime = Field(default_factory=lambda: datetime.now(UTC))  # Transaction date
    description: str | None = None  # Transaction description

    @field_validator("amount", mode="before")
    @classmethod
    def validate_amount(cls, v: Any) -> Decimal:
        return convert_decimal128(v)

    @field_validator("date", mode="before")
    @classmethod
    def validate_date(cls, v: datetime | None) -> datetime:
        if v is None:
            return datetime.now(UTC)
        if v.tzinfo is None:
            return v.replace(tzinfo=UTC)
        return v

    @override
    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        data = super().model_dump(*args, **kwargs)
        if "amount" in data:
            data["amount"] = float(data["amount"])
        # Convert ObjectId to string
        if "id" in data:
            data["id"] = str(data["id"])
        if "user_id" in data:
            data["user_id"] = str(data["user_id"])
        return data

    class Settings:
        name = "transactions"  # Collection name in MongoDB
        json_encoders: ClassVar[dict[type, Any]] = {
            Decimal: float,
            PydanticObjectId: str,
        }  # Convert Decimal to float during serialization
        indexes: ClassVar[list[str | tuple[str, ...]]] = [
            "user_id",  # For quick retrieval of all user transactions
            ("user_id", "date"),  # For time reports and sorting by date
            ("user_id", "category"),  # For grouping by categories
            ("user_id", "type"),  # For filtering by type (expense/income)
            ("user_id", "amount"),  # For sorting by amount
            # Composite index for complex analytics: transactions by categories over a period
            ("user_id", "category", "date"),
            # Composite index for filtering by type and date
            ("user_id", "type", "date"),
        ]


# 🔐 Model for storing refresh tokens in MongoDB
class RefreshToken(Document):
    user_id: PydanticObjectId
    token: str
    created_at: datetime
    expires_at: datetime

    class Settings:
        name = "refresh_tokens"
        indexes: ClassVar[list[str | tuple[str, ...]]] = [
            "token",
            "user_id",
            ("user_id", "expires_at"),
        ]
        json_encoders: ClassVar[dict[type, Any]] = {
            PydanticObjectId: str,
            datetime: str,
        }


class Category(Document):
    """
    📂 Expense category (custom or default)
    """

    name: str = Field(..., min_length=1, max_length=50)  # Category name
    icon: str | None = Field(default=None, max_length=10)  # Emoji/icon (optional)
    color: str | None = Field(
        default=None,
        pattern="^#[0-9a-fA-F]{6}$",
        description="HEX color code (e.g. #FF5733)",
    )  # Category color (optional)
    user_id: PydanticObjectId | None = None  # If None — default, otherwise custom
    is_default: bool = False  # Used for global categories

    @override
    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        data = super().model_dump(*args, **kwargs)
        if "user_id" in data and data["user_id"] is not None:
            data["user_id"] = str(data["user_id"])
        return data

    class Settings:
        name = "categories"
        indexes: ClassVar[list[str | tuple[str, str]]] = [
            "user_id",
            ("name", "user_id"),
        ]
        json_encoders: ClassVar[dict[type, Any]] = {
            PydanticObjectId: str,
        }


class PaymentMethod(Document):
    """
    💳 Custom user payment method
    """

    name: str  # Name: "TD Debit 1234"
    bank: str | None = None  # Bank name: TD, CIBC, etc.
    card_type: str | None = Field(
        default=None, pattern="^(credit|debit)$"
    )  # Type: debit or credit
    last4: str | None = Field(default=None, min_length=4, max_length=4)  # Last 4 digits
    icon: str | None = None  # 🎨 Emoji or icon: 🏦 💳
    user_id: PydanticObjectId  # Link to user

    @override
    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        data = super().model_dump(*args, **kwargs)
        if "user_id" in data:
            data["user_id"] = str(data["user_id"])
        return data

    class Settings:
        name = "payment_methods"
        indexes: ClassVar[list[str | tuple[str, ...]]] = [
            "user_id",
            ("user_id", "card_type"),
            ("user_id", "bank"),
        ]
        json_encoders: ClassVar[dict[type, Any]] = {
            PydanticObjectId: str,
        }


class Budget(Document):
    """
    💰 User budget model by categories
    """

    user_id: PydanticObjectId  # User ID
    category: str  # Category name (e.g., "food")
    limit: Decimal = Field(..., ge=0)  # Limit amount (non-negative)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC)
    )  # 🕒 UTC-modern time

    @field_validator("limit", mode="before")
    @classmethod
    def validate_limit(cls, v: Any) -> Decimal:
        return convert_decimal128(v)

    @override
    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        data = super().model_dump(*args, **kwargs)
        if "limit" in data:
            data["limit"] = float(data["limit"])
        return data

    class Settings:
        name = "budgets"
        json_encoders: ClassVar[dict[type, Any]] = {
            Decimal: float,
            PydanticObjectId: str,
            datetime: str,
        }
        indexes: ClassVar[list[str | tuple[str, ...]]] = [
            "user_id",
            ("user_id", "category"),
            ("user_id", "created_at"),
        ]


class BankConnection(Document):
    user_id: PydanticObjectId
    access_token: str
    item_id: str
    institution_id: str | None = Field(default=None)
    institution_name: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    @override
    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        data = super().model_dump(*args, **kwargs)
        if "user_id" in data:
            data["user_id"] = str(data["user_id"])
        return data

    class Settings:
        name = "bank_connections"
        json_encoders: ClassVar[dict[type, Any]] = {
            PydanticObjectId: str,
            datetime: str,
        }


class BankAccount(Document):
    user_id: PydanticObjectId
    bank_connection_id: PydanticObjectId  # relationship with BankConnection
    account_id: str  # ID from Plaid
    name: str
    official_name: str | None = None
    type: str
    subtype: str | None = None
    mask: str | None = None
    current_balance: float | None = None
    available_balance: float | None = None
    iso_currency_code: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    @override
    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        data = super().model_dump(*args, **kwargs)
        if "user_id" in data:
            data["user_id"] = str(data["user_id"])
        if "bank_connection_id" in data:
            data["bank_connection_id"] = str(data["bank_connection_id"])
        return data

    class Settings:
        name = "bank_accounts"
        json_encoders: ClassVar[dict[type, Any]] = {
            PydanticObjectId: str,
            datetime: str,
        }


class BankTransaction(Document):
    user_id: PydanticObjectId
    bank_account_id: PydanticObjectId  # relationship with BankAccount
    transaction_id: str  # from Plaid
    source: Literal["manual", "plaid"] = "plaid"  # for BankTransaction
    name: str
    amount: float
    date: date
    category: list[str] | None = None
    payment_method: str | None = None
    payment_channel: str | None = None
    iso_currency_code: str | None = None
    pending: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    @override
    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        data = super().model_dump(*args, **kwargs)
        if "user_id" in data:
            data["user_id"] = str(data["user_id"])
        if "bank_account_id" in data:
            data["bank_account_id"] = str(data["bank_account_id"])
        return data

    class Settings:
        name = "bank_transactions"
        json_encoders: ClassVar[dict[type, Any]] = {
            PydanticObjectId: str,
            datetime: str,
            date: str,
        }
