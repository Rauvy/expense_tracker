import secrets
from datetime import (  # Working with current time and calculating token expiration
    UTC,
    datetime,
    timedelta,
)
from typing import Any  # Removed Union import as it's no longer needed

import jwt
from beanie import PydanticObjectId
from fastapi import HTTPException, status

from src.config import config
from src.models import RefreshToken


def create_access_token(data: dict[str, Any]) -> str:
    """
    🔑 Creates JWT access token based on the provided data
    """
    # Copy data to avoid modifying the original
    to_encode = data.copy()

    # Convert PydanticObjectId to string if present
    if "sub" in to_encode and isinstance(to_encode["sub"], (PydanticObjectId, str)):
        to_encode["sub"] = str(to_encode["sub"])

    # Add token expiration time
    expire = datetime.now(UTC) + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    # Encode data into JWT
    return jwt.encode(
        to_encode, config.SECRET_KEY, algorithm=config.JWT_ALGORITHM
    )  # Return generated token (string)


def verify_access_token(token: str) -> dict[str, Any]:
    """
    Verify and decode access token.
    Arguments:
    - token: token received from user

    Returns:
    - Dictionary (payload) if token is valid
    - Error if token is forged or expired
    """
    try:
        # 🔐 Try to decrypt token using the secret key
        return jwt.decode(token, config.SECRET_KEY, algorithms=[config.JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        # ❌ If token is invalid or expired - return 401 Unauthorized
        # from None - hide original traceback as it's not needed by the client
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        ) from None


def create_refresh_token() -> tuple[str, datetime, datetime]:
    """
    Creates a secure random refresh token, creation date and expiration date.
    """
    token = secrets.token_urlsafe(64)  # 🔐 Secure string, like a session ID
    created_at = datetime.now(UTC)
    expires_at = created_at + timedelta(days=config.REFRESH_TOKEN_EXPIRE_DAYS)
    return token, created_at, expires_at


async def verify_refresh_token(token: str) -> RefreshToken:
    """
    Checks if the provided refresh token exists in the database,
    and if it hasn't expired.
    Returns Beanie document if token is valid.
    """

    # 🔎 Look for token in MongoDB by token value
    token_doc = await RefreshToken.find_one(RefreshToken.token == token)

    # ❌ If token not found - throw 401 error
    if not token_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    # ⏳ If token is expired
    if token_doc.expires_at.replace(tzinfo=UTC) < datetime.now(UTC):
        _ = await token_doc.delete()  # 💀 Delete expired token from database
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired"
        )

    # ✅ All good - return found document
    return token_doc


async def save_refresh_token_to_db(
    user_id: str, token: str, created_at: datetime, expires_at: datetime
) -> None:
    """
    Creates RefreshToken document and saves it to MongoDB collection.
    """
    refresh_token_doc = RefreshToken(
        user_id=PydanticObjectId(user_id),  # Convert string ID to PydanticObjectId
        token=token,  # Unique token, securely generated
        created_at=created_at,  # Token creation time
        expires_at=expires_at,  # Token expiration time
    )

    _ = await refresh_token_doc.insert()  # 🧠 Save document to MongoDB
