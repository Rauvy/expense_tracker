from typing import Annotated  # ✅ Modern way to annotate Depends

from fastapi import APIRouter, Depends, HTTPException, status  # 🚀 FastAPI tools

from src.auth.dependencies import get_current_user  # 🔐 Get current user
from src.models import Budget, User  # 🧠 Budget and user models
from src.schemas.budget import BudgetCreate, BudgetPublic, BudgetUpdate  # 📦 Schemas for work

# ⚙️ Router with prefix /budgets
router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_budget(
    budget_in: BudgetCreate,  # 🔽 Get data from client (category + limit)
    current_user: Annotated[User, Depends(get_current_user)],  # 🔐 Authorized user
) -> BudgetPublic:
    """
    ➕ Create user budget by category
    """
    if not current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID is required",
        )

    # 🔍 Check if budget for this category already exists
    existing = await Budget.find_one(
        Budget.user_id == current_user.id,
        Budget.category == budget_in.category,
    )
    if existing:
        # ⚠️ If exists — throw 409 error (conflict)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Budget for this category already exists.",
        )

    # 🆕 Create new budget
    budget = Budget(user_id=current_user.id, **budget_in.model_dump())

    # 💾 Save to database
    _ = await budget.insert()

    # 📤 Return public schema to client
    return BudgetPublic(**budget.model_dump())


@router.get("/")
async def get_budgets(
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[BudgetPublic]:
    """
    📄 Get all user budgets
    """
    if not current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID is required",
        )

    # 📦 Get all user budgets
    budgets = await Budget.find(Budget.user_id == current_user.id).to_list()

    # 🧾 Transform to list of public schemas
    return [BudgetPublic(**b.model_dump()) for b in budgets]


@router.put("/{category}")
async def update_budget(
    category: str,  # 🏷 Category name in URL
    update: BudgetUpdate,  # 🛠 New limit value
    current_user: Annotated[User, Depends(get_current_user)],  # 🔐 User
) -> BudgetPublic:
    """
    ✏️ Update budget limit by category
    """
    if not current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID is required",
        )

    # 🔎 Find budget by category and user
    budget = await Budget.find_one(
        Budget.user_id == current_user.id,
        Budget.category == category,
    )
    if not budget:
        # ❌ If not found — 404
        raise HTTPException(status_code=404, detail="Budget not found")

    # 💸 Update limit
    budget.limit = update.limit

    # 💾 Save
    _ =await budget.save()

    # 📤 Return
    return BudgetPublic(**budget.model_dump())


@router.delete("/{category}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    category: str,  # 🏷 Category in URL
    current_user: Annotated[User, Depends(get_current_user)],  # 🔐 User
) -> None:
    """
    ❌ Delete budget by category
    """
    if not current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID is required",
        )

    # 🔎 Find budget
    budget = await Budget.find_one(
        Budget.user_id == current_user.id,
        Budget.category == category,
    )
    if not budget:
        # ❌ Not found — 404
        raise HTTPException(status_code=404, detail="Budget not found")

    # 🧹 Delete
    _ = await budget.delete()
