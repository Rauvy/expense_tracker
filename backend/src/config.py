from typing import Final

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

_ = load_dotenv()


class Config(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    MONGODB_URI: str
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Google OAuth
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None

    # OpenAI
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4-turbo"
    OPENAI_TEMPERATURE: float = 0.7
    OPENAI_MAX_TOKENS: int = 300

    # Plaid
    PLAID_CLIENT_ID: str
    PLAID_SECRET: str
    PLAID_ENV: str  # 'sandbox', 'development', 'production'


def get_config() -> Config:
    return Config()  # pyright: ignore[reportCallIssue]


config = get_config()  # Create an instance only when the module is imported

# ────────────── 📊 Analytics constants ──────────────
# Valid time intervals for charts
TIME_FRAMES: Final[dict[str, int]] = {
    "day": 1,
    "week": 7,
    "month": 30,
    "year": 365,
}


# ────────────── 🤖 AI constants ──────────────
