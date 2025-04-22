# Annotated is needed for declaring dependencies (here - token from request)
from typing import Annotated

# Import dependencies from FastAPI
from fastapi import Depends, HTTPException, status

# Special class that allows getting token from Authorization header
from fastapi.security import OAuth2PasswordBearer

# JWTError - error thrown by the library when there are problems with the token
from jose import JWTError

# Import functions for error handling
from src.auth.exceptions import raise_unauthorized_error

# Import our function for token verification
from src.auth.jwt import verify_access_token

# Import user model from database (Beanie model)
from src.models import User

# Create authorization scheme - FastAPI will look for token in Authorization header: Bearer <token>
# And pass it to the dependency
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# This function will be used in protected endpoints to get the current user
# It takes token as a dependency and returns User object if token is valid
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    try:
        # Decode token and get payload (e.g.: {"sub": "user_id"})
        payload = verify_access_token(token)

        # Get user_id from payload
        user_id = payload.get("sub")

        # If ID is not in payload, then token is invalid
        if user_id is None:
            raise_unauthorized_error("Invalid token: user ID not found")

        # Find user by ID in database
        user = await User.get(user_id)

        # If user not found - then token "pointed" to non-existent user
        if user is None:
            raise_unauthorized_error("User not found")

    except JWTError:
        raise_unauthorized_error("Could not validate credentials")
    else:
        return user


def validate_google_names(given_name: str | None, family_name: str | None) -> None:
    """Checks if first and last name are present in Google profile."""
    if not given_name or not family_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google profile must include first and last name",
        )
