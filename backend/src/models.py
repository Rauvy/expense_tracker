from datetime import UTC, datetime  # Импортируем UTC и datetime для работы с временем
from typing import Optional  # Optional нужен для необязательных полей

from beanie import (  # Document — модель для MongoDB, PydanticObjectId — ID-шка
    Document,
    PydanticObjectId,
)
from pydantic import (  # EmailStr — проверка email, Field — для задания default значений
    EmailStr,
    Field,
)


# Модель пользователя, хранится в коллекции "users"
class User(Document):
    email: EmailStr  # Обязательное поле email, автоматически проверяется
    hashed_password: str  # Пароль в зашифрованном виде

    class Settings:
        name = "users"  # Название коллекции в MongoDB


# Модель расхода (траты), будет храниться в коллекции "expenses"
class Expense(Document):
    title: str  # Название расхода (например, "Продукты", "Кафе")
    amount: float  # Сумма расхода
    category: str | None = None  # Категория (например, "Еда", "Транспорт"), можно оставить пустым
    payment_method: str | None = (
        None  # 💳 Способ оплаты (например, "Visa", "Cash"), можно оставить пустым
    )
    saved_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    # Дата расхода, по умолчанию текущее время в UTC

    user_id: PydanticObjectId  # ID пользователя, которому принадлежит расход

    class Settings:
        name = "expenses"  # Название коллекции в MongoDB


# 🔐 Модель для хранения refresh токенов в MongoDB
class RefreshToken(Document):
    user_id: str  # ID пользователя, которому принадлежит токен
    token: str  # Сам refresh токен (уникальная строка)
    created_at: datetime  # Дата и время, когда токен был создан
    expires_at: datetime  # Срок действия токена (после этой даты он считается недействительным)

    class Settings:
        name = "refresh_tokens"  # 👈 Указываем имя коллекции в MongoDB