import re
from typing import Annotated

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from src.auth.dependencies import get_current_user
from src.models import Category, Transaction, User
from src.schemas.category_schemas import CategoryCreate, CategoryPublic, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/")
async def get_categories(
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[CategoryPublic]:
    """
    🔍 Get all categories (global + user custom)
    """
    categories = await Category.find(
        {"$or": [{"user_id": current_user.id}, {"user_id": None}]}
    ).to_list()

    return [CategoryPublic.model_validate(cat.model_dump()) for cat in categories]
    # ✅ .model_validate() — modern alternative to model_dump
    # Return list of custom and default categories


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: CategoryCreate, current_user: Annotated[User, Depends(get_current_user)]
) -> CategoryPublic:
    """
    ➕ Create custom category (without duplicates, ignoring case and spaces)
    """
    # 🧼 Remove spaces around name
    clean_name = category_in.name.strip()

    # ⛔ Check for duplicates (case-insensitive and considering spaces)
    existing = await Category.find_one(
        {
            "user_id": current_user.id,
            "name": {"$regex": f"^{re.escape(clean_name)}$", "$options": "i"},
        }
    )

    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists.")

    # ✅ Create new category
    category = Category(
        name=clean_name,
        icon=category_in.icon,
        user_id=PydanticObjectId(current_user.id),
        color=category_in.color,
        is_default=False,
    )
    _ = await category.insert()

    return CategoryPublic.model_validate(category.model_dump())


@router.delete("/{category_id}")
async def delete_category(
    category_id: PydanticObjectId, current_user: Annotated[User, Depends(get_current_user)]
) -> dict[str, str]:
    """
    ❌ Delete custom category and replace it in transactions with 'Uncategorized'
    """
    category = await Category.get(category_id)

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="You are not authorized to delete this category"
        )

    # 👇 Update all transactions where this category was used
    _ = await Transaction.find(
        Transaction.user_id == current_user.id, Transaction.category == category.name
    ).update_many({"$set": {"category": "Uncategorized"}})

    # 🗑 Delete category
    _ = await category.delete()

    return {"detail": "Category deleted successfully"}


@router.put("/{category_id}")
async def update_category(
    category_id: PydanticObjectId,
    category_in: CategoryUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> CategoryPublic:
    """
    ✏️ Update category by ID
    """
    # Get category by ID
    category = await Category.get(category_id)

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this category")

    # Update provided fields
    if category_in.name is not None:
        category.name = category_in.name
    if category_in.color is not None:
        category.color = category_in.color
    if category_in.icon is not None:
        category.icon = category_in.icon

    _ = await category.save()

    return CategoryPublic.model_validate(category.model_dump())


@router.get("/{category_id}")
async def get_category_by_id(
    category_id: PydanticObjectId,
    current_user: Annotated[User, Depends(get_current_user)],
) -> CategoryPublic:
    """
    🔍 Get category by ID (modern Beanie + FastAPI style)
    """
    category = await Category.get(category_id)

    if not category or category.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    return CategoryPublic(**category.model_dump())
