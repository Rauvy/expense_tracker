from beanie import PydanticObjectId  # For MongoDB object IDs
from pydantic import BaseModel, Field  # Pydantic for schemas, Field for validation


class PaymentMethodCreate(BaseModel):
    """
    📝 Schema for creating payment method (from client)
    """

    name: str  # Method name (e.g., "TD Credit 1234")
    bank: str | None = None  # Bank name (optional)
    card_type: str | None = Field(default=None, pattern="^(credit|debit)$")  # Card type
    last4: str | None = Field(default=None, min_length=4, max_length=4)  # Last 4 digits of card
    icon: str | None = None  # Icon: 💳, 🏦, 🧾 etc.


class PaymentMethodPublic(BaseModel):
    """
    📤 Schema returned to client
    """

    id: PydanticObjectId  # Unique MongoDB ID
    name: str
    bank: str | None = None
    card_type: str | None = None
    last4: str | None = None
    icon: str | None = None


class PaymentMethodUpdate(BaseModel):
    name: str | None = None
    bank: str | None = None
    card_type: str | None = None
    icon: str | None = None
