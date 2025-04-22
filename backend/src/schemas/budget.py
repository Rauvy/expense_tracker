from datetime import datetime
from decimal import Decimal

from beanie import PydanticObjectId
from pydantic import BaseModel, Field


class BudgetCreate(BaseModel):
    """
    📥 Creating a new budget
    """

    category: str  # Category for which the limit is set
    limit: Decimal = Field(..., ge=0)  # Required field - limit amount


class BudgetUpdate(BaseModel):
    """
    🛠 Updating budget limit
    """

    limit: Decimal = Field(..., ge=0)  # Only limit can be updated


class BudgetPublic(BaseModel):
    """
    📤 Response to client: budget information
    """

    id: PydanticObjectId  # Mongo ID
    category: str
    limit: Decimal
    created_at: datetime

