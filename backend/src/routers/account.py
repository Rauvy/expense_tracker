from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext

from src.auth.dependencies import get_current_user
from src.models import User
from src.schemas.base import PasswordUpdateRequest, PasswordUpdateResponse

router = APIRouter(prefix="/account", tags=["Account"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("/me")
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, str]:
    """
    🔍 Get information about current user
    """
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
    }


@router.delete("/delete")
async def delete_account(
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, str]:
    """
    ❌ Delete user account
    """
    _ = await current_user.delete()
    return {"message": "Account deleted successfully"}


@router.put("/update-password")
async def update_password(
    data: PasswordUpdateRequest,
    user: Annotated[User, Depends(get_current_user)],
) -> PasswordUpdateResponse:
    """
    🔐 Update user password
    """
    # 🔐 Check that new password is different from the old one
    if data.old_password == data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the old one",
        )

    # 🔐 Verify current password
    if not pwd_context.verify(data.old_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Old password is incorrect",
        )

    # 🔐 Hash and save the new password
    user.hashed_password = pwd_context.hash(data.new_password)
    _ = await user.save()

    # ✅ Return confirmation
    return PasswordUpdateResponse()


@router.get("/balance")
async def get_balance(
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, float]:
    """
    💰 Get current user balance
    """
    return {"balance": float(current_user.balance)}
