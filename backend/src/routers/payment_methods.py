import re
from typing import Annotated

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from src.auth.dependencies import get_current_user
from src.models import PaymentMethod, Transaction, User
from src.schemas.payment_method_schemas import (
    PaymentMethodCreate,
    PaymentMethodPublic,
    PaymentMethodUpdate,
)

router = APIRouter(prefix="/payment-methods", tags=["Payment Methods"])


@router.get("/")
async def get_user_payment_methods(
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[PaymentMethodPublic]:
    """
    🔍 Get all user payment methods
    """
    if not current_user.id:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    methods = await PaymentMethod.find(PaymentMethod.user_id == current_user.id).to_list()
    return [PaymentMethodPublic.model_validate(m.model_dump()) for m in methods]


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_payment_method(
    method_in: PaymentMethodCreate, current_user: Annotated[User, Depends(get_current_user)]
) -> PaymentMethodPublic:
    """
    ➕ Add payment method (without duplicates, case-insensitive and ignoring spaces)
    """
    if not current_user.id:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # 🧼 Clean name from spaces
    clean_name = method_in.name.strip()

    # ⛔ Check for duplicates
    existing = await PaymentMethod.find_one(
        {
            "user_id": current_user.id,
            "name": {"$regex": f"^{re.escape(clean_name)}$", "$options": "i"},
        }
    )

    if existing:
        raise HTTPException(
            status_code=400, detail="Payment method with this name already exists."
        )

    # ✅ Save cleaned name
    method = PaymentMethod(
        name=clean_name,
        bank=method_in.bank,
        card_type=method_in.card_type,
        last4=method_in.last4,
        icon=method_in.icon,
        user_id=PydanticObjectId(current_user.id),
    )
    _ = await method.insert()

    return PaymentMethodPublic.model_validate(method.model_dump())


@router.delete("/{method_id}")
async def delete_payment_method(
    method_id: PydanticObjectId, current_user: Annotated[User, Depends(get_current_user)]
) -> dict[str, str]:
    """
    ❌ Delete payment method and replace it in transactions with 'Undefined'
    """
    method = await PaymentMethod.get(method_id)
    if not method:
        raise HTTPException(status_code=404, detail="Payment method not found")
    if method.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # 🔁 Update transactions using this method
    _ = await Transaction.find(
        Transaction.user_id == current_user.id, Transaction.payment_method == method.name
    ).update_many({"$set": {"payment_method": "Undefined"}})

    # 🗑 Delete method
    _ = await method.delete()

    return {"detail": "Payment method deleted"}


@router.put("/{method_id}")
async def update_payment_method(
    method_id: str,
    method_in: PaymentMethodUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> PaymentMethodPublic:
    """
    ✏️ Update payment method by ID
    """
    # Get method by ID
    method = await PaymentMethod.get(PydanticObjectId(method_id))

    if not method:
        raise HTTPException(status_code=404, detail="Payment method not found")

    if method.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this method")

    # Update fields
    if method_in.name is not None:
        method.name = method_in.name
    if method_in.bank is not None:
        method.bank = method_in.bank
    if method_in.card_type is not None:
        method.card_type = method_in.card_type
    if method_in.icon is not None:
        method.icon = method_in.icon

    _ = await method.save()

    return PaymentMethodPublic.model_validate(method.model_dump())


@router.get("/{method_id}")
async def get_payment_method_by_id(
    method_id: PydanticObjectId,
    current_user: Annotated[User, Depends(get_current_user)],
) -> PaymentMethodPublic:
    """
    🔍 Get payment method by ID (modern Beanie + FastAPI style)
    """
    method = await PaymentMethod.get(method_id)

    if not method or method.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Payment method not found"
        )

    return PaymentMethodPublic(**method.model_dump())
