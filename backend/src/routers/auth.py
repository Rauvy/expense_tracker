# Import needed dependencies from FastAPI
import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status

# Import for password hashing
from passlib.context import CryptContext

from src.auth.dependencies import get_current_user
from src.auth.google_oauth import TokenResponse, handle_google_login

# Import JWT token creation function
from src.auth.jwt import (
    create_access_token,  # if you've already implemented
    create_refresh_token,
    save_refresh_token_to_db,
    verify_refresh_token,
)

# Import Beanie user model (for MongoDB)
from src.models import RefreshToken, User

# Import Pydantic schemas for input/output validation
from src.schemas.base import GoogleLoginPayload, UserCreate, UserLogin, UserPublic

# Create router for "/auth" route group
router = APIRouter(prefix="/auth", tags=["Auth"])

# Create object for password hashing and verification using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Hash password during registration
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# User registration endpoint
@router.post("/register")  # Returns public user data
async def register(
    user_in: UserCreate,
) -> UserPublic:  # user_in — input data (email + password)
    # Check if user with this email already exists
    existing_user = await User.find_one(User.email == user_in.email)
    if existing_user:
        # If exists — throw exception
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Hash password before saving
    hashed = hash_password(user_in.password)

    # Create new user and save to database
    user = User(
        email=user_in.email,
        hashed_password=hashed,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        birth_date=user_in.birth_date,
        balance=user_in.initial_balance,  # Set initial balance
    )
    _ = await user.insert()

    # If for some reason user.id was not created — error
    if not user.id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user"
        )

    # Return public user data (without password)
    return UserPublic(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        birth_date=user.birth_date,
        balance=user.balance,  # Add balance
    )


# User login endpoint
@router.post("/login")
async def login(user_in: UserLogin) -> dict[str, str]:
    user = await User.find_one(User.email == user_in.email)
    if not user or not pwd_context.verify(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token, created_at, expires_at = create_refresh_token()

    await save_refresh_token_to_db(
        user_id=str(user.id),
        token=refresh_token,
        created_at=created_at,
        expires_at=expires_at,
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }  # Standard OAuth 2.0 token type


@router.post("/google")
async def google_login(payload: GoogleLoginPayload) -> TokenResponse:
    """
    🔐 Login via Google:
    Takes id_token from client, verifies it through Google,
    creates user (if needed) and returns tokens.
    """
    # 📥 Get id_token from request body
    id_token_str = payload.id_token

    # ❌ If token is missing — error
    if not id_token_str:
        raise HTTPException(status_code=400, detail="id_token required")

    # ✅ Call function that does all the magic
    return await handle_google_login(id_token_str)


@router.post("/refresh")
async def refresh_tokens(request: Request) -> dict[str, str]:
    """
    🔄 Token refresh:
    1. Verify refresh token
    2. Delete old refresh token
    3. Create new refresh token
    4. Create new access token
    """
    data = await request.json()
    incoming_token = data.get("refresh_token")

    if not incoming_token:
        raise HTTPException(status_code=400, detail="Refresh token required")

    # Verify token
    token_doc = await verify_refresh_token(incoming_token)

    # Delete old refresh token
    _ = await token_doc.delete()

    # Generate new refresh token
    new_refresh_token, created_at, expires_at = create_refresh_token()

    # Save new refresh token
    await save_refresh_token_to_db(
        user_id=str(token_doc.user_id),
        token=new_refresh_token,
        created_at=created_at,
        expires_at=expires_at,
    )

    # Create new access token
    new_access_token = create_access_token({"sub": str(token_doc.user_id)})

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",  # Standard OAuth 2.0 token type
    }


@router.post("/logout")
async def logout(request: Request) -> dict[str, str]:
    """
    🚪 Logout from system:
    1. Get refresh token from request body
    2. Delete only this specific token
    """
    try:
        data = await request.json()
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Missing or invalid JSON body"
        ) from e

    incoming_token = data.get("refresh_token")

    if not incoming_token:
        raise HTTPException(status_code=400, detail="Refresh token required")

    # Verify token
    token_doc = await verify_refresh_token(incoming_token)

    # Delete only this specific token
    _ = await token_doc.delete()

    return {"detail": "Successfully logged out"}


@router.post("/logout-all")
async def logout_all(
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, str]:
    """
    🚪 Logout from all devices:
    1. Get current user via access token
    2. Delete all refresh tokens for this user
    """
    if not current_user or not current_user.id:
        raise HTTPException(status_code=401, detail="Invalid user")

    # Delete all user's refresh tokens
    _ = await RefreshToken.find(RefreshToken.user_id == current_user.id).delete()

    return {"detail": "Logged out from all devices"}
