"""Request bodies. Response bodies reuse app.models.Transaction directly."""
from typing import Optional

from pydantic import BaseModel, Field

from app.models import Category


class ManualExpenseInput(BaseModel):
    """POST /api/expenses/manual — mirrors ManualExpenseInput in types.ts."""

    merchant: str
    amount: float = Field(gt=0)
    category: Category
    isCashEntry: bool = True


class ExpenseUpdate(BaseModel):
    """
    PATCH /api/expenses/{id} — used for both the tag toggle (personal /
    business / internal transfer) and split-share edits. Every field is
    optional; only the ones sent are applied.
    """

    isBusiness: Optional[bool] = None
    isTransfer: Optional[bool] = None
    isSplit: Optional[bool] = None
    shareAmount: Optional[float] = Field(default=None, gt=0)
