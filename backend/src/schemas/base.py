# Import base model from Pydantic - it's used for validation and serialization of data
# Import ObjectId type which Beanie uses for MongoDB documents
from datetime import datetime
from decimal import Decimal  # Add Decimal import

from beanie import PydanticObjectId
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from src.models import TransactionType


class BaseModelWithConfig(BaseModel):
    """Base model with serialization settings"""

    model_config = ConfigDict(
        json_encoders={
            PydanticObjectId: str,  # MongoDB ID -> string
            Decimal: str,  # Decimal -> string
        }
    )


class BaseModelWithDecimalAsFloat(BaseModel):
    """Base model for transactions where Decimal is converted to float"""

    model_config = ConfigDict(
        json_encoders={
            PydanticObjectId: str,  # MongoDB ID -> string
            Decimal: float,  # Decimal -> float for numeric fields
        }
    )


# ---------- 📥 Models received from client (incoming data) ----------


# Model that client sends during registration
class UserCreate(BaseModelWithConfig):
    email: EmailStr  # Email - automatically validated as email
    password: str  # Password as string (in clear text at this stage)
    first_name: str  # User's first name (required)
    last_name: str  # User's last name (required)
    birth_date: datetime | None = None  # Birth date
    initial_balance: Decimal = Field(default=Decimal("0.00"))  # Initial balance


# Model that client sends during login
class UserLogin(BaseModelWithConfig):
    email: EmailStr  # Also email
    password: str  # Password to check against hash from database


# ---------- 📤 Models returned to client (API responses) ----------


# Public user model - without password
class UserPublic(BaseModelWithConfig):
    id: PydanticObjectId  # Unique user identifier in MongoDB database
    email: EmailStr  # User's email that we can safely return
    first_name: str  # User's first name
    last_name: str  # User's last name
    birth_date: datetime | None = None  # Birth date
    balance: Decimal  # Current user balance


# Token model returned after successful login
class Token(BaseModel):
    access_token: str  # JWT token that we'll create
    refresh_token: str | None = None  # JWT token that we'll create
    token_type: str = "bearer"  # Token type - always "bearer" for OAuth2 compatibility


# Input: client creates new expense
class ExpenseCreate(BaseModel):
    amount: Decimal
    category: str | None = None
    payment_method: str | None = None
    date: datetime | None = None
    description: str | None = None


# Output: server returns created expense
class ExpensePublic(BaseModel):
    id: PydanticObjectId
    amount: Decimal
    category: str | None = None
    payment_method: str | None = None
    date: datetime | None = None
    description: str | None = None
    user_id: PydanticObjectId


# Model for creating transaction (income or expense)
class TransactionCreate(BaseModelWithDecimalAsFloat):
    amount: Decimal
    type: TransactionType  # Use enum instead of string
    category: str | None = None
    payment_method: str | None = None
    source: str | None = None  # For income
    date: datetime | None = None
    description: str | None = None


# Model for returning transaction to client
class TransactionPublic(BaseModelWithDecimalAsFloat):
    id: PydanticObjectId
    amount: Decimal
    type: TransactionType  # Use enum instead of string
    category: str | None = None
    payment_method: str | None = None
    source: str | None = None
    date: datetime | None = None
    description: str | None = None
    user_id: PydanticObjectId
    model_config = ConfigDict(json_encoders={PydanticObjectId: str})


class PaginatedTransactionsResponse(BaseModel):
    items: list[TransactionPublic]
    total: int
    limit: int
    offset: int
    has_next: bool

    model_config = ConfigDict(json_encoders={PydanticObjectId: str})


# Model for payment method
# Model for Google OAuth
class GoogleLoginPayload(BaseModel):
    id_token: str


# Model for token response
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


# Model for password update
class PasswordUpdateRequest(BaseModel):
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=8)


# Model for password update response
class PasswordUpdateResponse(BaseModel):
    detail: str = "Password updated successfully."
