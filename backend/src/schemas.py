# Импортируем базовую модель из Pydantic — она используется для валидации и сериализации данных
# Импортируем тип ObjectId, который Beanie использует для MongoDB-документов
from datetime import datetime

from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr

# ---------- 📥 Модели, получаемые от клиента (входящие данные) ----------


# Модель, которую клиент отправляет при регистрации
class UserCreate(BaseModel):
    email: EmailStr  # Email — валидируется автоматически как email
    password: str  # Пароль в виде строки (в открытом виде на этом этапе)


# Модель, которую клиент отправляет при логине
class UserLogin(BaseModel):
    email: EmailStr  # Тоже email
    password: str  # Пароль, чтобы проверить его с хэшем из базы


# ---------- 📤 Модели, которые возвращаются клиенту (ответы API) ----------


# Публичная модель пользователя — без пароля
class UserPublic(BaseModel):
    id: PydanticObjectId  # Уникальный идентификатор пользователя в базе MongoDB
    email: EmailStr  # Email пользователя, который мы можем безопасно вернуть


# Модель токена, возвращаемая после успешного логина
class Token(BaseModel):
    access_token: str  # JWT-токен, который мы создадим
    refresh_token: str  # JWT-токен, который мы создадим
    token_type: str = "bearer"  # Тип токена — всегда "bearer" для совместимости с OAuth2


# Вход: клиент создаёт новый расход
class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str | None = None
    payment_method: str | None = None


# Ответ клиенту: публичная информация о расходе
class ExpensePublic(BaseModel):
    id: PydanticObjectId
    title: str
    amount: float
    category: str | None = None
    payment_method: str | None = None
    saved_at: datetime