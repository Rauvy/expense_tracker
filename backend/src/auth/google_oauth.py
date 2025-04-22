from fastapi import HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from src.auth.dependencies import validate_google_names
from src.auth.exceptions import (
    raise_conflict_error,
    raise_invalid_token_error,
)
from src.auth.jwt import (
    create_access_token,
    create_refresh_token,
    save_refresh_token_to_db,
)
from src.models import User
from src.schemas.base import TokenResponse


async def handle_google_login(id_token_str: str) -> TokenResponse:
    """
    🔐 Handles login via Google:
    - verifies id_token authenticity
    - extracts email and Google ID
    - finds or creates user
    - returns access and refresh tokens
    """

    try:
        # ✅ Verify token authenticity (through Google server)
        id_info = id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
        )

        email = id_info.get("email")
        google_sub = id_info.get("sub")

        if not email or not google_sub:
            raise_invalid_token_error(
                "Invalid Google token: missing required fields (email or sub)."
            )

        # 🔍 Search by google_id
        user = await User.find_one({"google_id": google_sub})

        if not user:
            # 🔁 Try to find by email
            user = await User.find_one({"email": email})

            if user:
                # ⚠️ Email already used by regular user
                if not user.google_id:
                    raise_conflict_error(
                        "User with this email already exists. Use email/password login."
                    )
                else:
                    # 🔧 Update google_id if it wasn't set
                    user.google_id = google_sub
                    _ = await user.save()
            else:
                # 🆕 New user
                given_name = id_info.get("given_name")
                family_name = id_info.get("family_name")
                validate_google_names(given_name, family_name)

                user = User(
                    email=email,
                    hashed_password=None,
                    google_id=google_sub,
                    first_name=given_name,
                    last_name=family_name,
                    birth_date=id_info.get("birthdate"),
                )
                _ = await user.insert()

        # 🪪 Create access/refresh tokens
        access_token = create_access_token({"sub": str(user.id)})
        refresh_token, created_at, expires_at = create_refresh_token()

        await save_refresh_token_to_db(
            user_id=str(user.id),
            token=refresh_token,
            created_at=created_at,
            expires_at=expires_at,
        )

    except ValueError as err:
        # ⛔ Invalid or expired token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired Google ID token."
        ) from err

    except HTTPException:
        # 🚫 Already thrown error - don't catch again
        raise

    except Exception as err:
        # 💥 Unexpected server error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during Google login.",
        ) from err

    else:
        # ✅ Return tokens to client
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )
