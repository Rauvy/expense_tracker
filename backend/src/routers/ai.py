import os
from collections import defaultdict
from datetime import UTC, datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from openai import AsyncOpenAI

from src.auth.dependencies import get_current_user
from src.models import Transaction, TransactionType, User
from src.utils.analytics_helper import round_decimal
from src.utils.error_messages import OPENAI_ERROR_MESSAGE, OPENAI_KEY_MISSING

# ────────────── 📍 AI Router ──────────────
router = APIRouter(prefix="/ai", tags=["AI"])

# ────────────── 🔐 OpenAI Initialization ──────────────
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise RuntimeError(OPENAI_KEY_MISSING)

openai_client = AsyncOpenAI(api_key=openai_api_key)


# ────────────── 🤖 AI Endpoint for tips ──────────────
@router.get("/tips")
async def get_ai_tips(
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, str | list[str]]:
    """
    🤖 Returns spending tips based on user's expense analytics.
    Uses GPT to generate personalized recommendations.
    """
    now = datetime.now(UTC)
    start_of_month = datetime(now.year, now.month, 1, tzinfo=UTC)

    # Now get user expenses
    all_expenses = await Transaction.find(
        Transaction.user_id == current_user.id, Transaction.type == TransactionType.EXPENSE
    ).to_list()

    # Filter expenses for current month
    expenses = []
    for exp in all_expenses:
        # Make sure expense date has UTC timezone
        exp_date = exp.date.replace(tzinfo=UTC) if exp.date.tzinfo is None else exp.date
        if exp_date >= start_of_month:
            expenses.append(exp)

    if not expenses:
        raise HTTPException(status_code=404, detail="No expenses found to analyze")

    # 📊 Group by categories
    by_category: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    total: Decimal = Decimal("0")

    for exp in expenses:
        amount: Decimal = exp.amount
        if exp.category:
            by_category[exp.category] += amount
            total += amount

    assert isinstance(total, Decimal)  # Ensure total is Decimal

    # ✍️ Compose text for GPT
    analysis_text = "\n".join(
        [f"- {cat}: {round_decimal(amount)} CAD" for cat, amount in by_category.items()]
    )

    system_prompt = (
        "You are a bold and smart financial coach. Write strictly to the point, concisely. "
        "Tips should be useful and specific. No fluff or repetition. Answer in English."
    )

    user_prompt = (
        f"Monthly expenses: {round_decimal(total)} CAD.\n"
        f"Categories:\n{analysis_text}\n\n"
        f"Give me 3 tips on how to improve my spending."
    )

    # 🚀 Send request to OpenAI
    try:
        response = await openai_client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4-turbo"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=OPENAI_ERROR_MESSAGE.format(str(e))) from e

    # 📤 Return list of tips
    answer = response.choices[0].message.content
    model_used = os.getenv("OPENAI_MODEL", "gpt-4-turbo")
    return {"model": model_used, "tips": answer.strip().split("\n") if answer else ["No tips"]}
