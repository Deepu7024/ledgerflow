"""
Domain model. Field names are deliberately camelCase (not idiomatic Python)
so the JSON this API produces matches src/types.ts on the frontend byte for
byte, with no key translation on either side.
"""
from enum import Enum
from typing import Optional
from uuid import uuid4

from sqlmodel import Field, SQLModel


class Category(str, Enum):
    FOOD_AND_DINING = "Food & Dining"
    ENTERTAINMENT = "Entertainment"
    SHOPPING = "Shopping"
    UTILITIES = "Utilities"
    GROCERIES = "Groceries"
    TRAVEL = "Travel"
    HEALTH = "Health"
    BUSINESS = "Business"
    PERSONAL = "Personal"
    OTHER = "Other"


class Source(str, Enum):
    SMS = "SMS"
    CASH = "Cash"
    PHONEPE = "PhonePe"


def new_id() -> str:
    return uuid4().hex


class Transaction(SQLModel, table=True):
    """Mirrors the Transaction interface in src/types.ts."""

    id: str = Field(default_factory=new_id, primary_key=True)
    merchant: str
    category: str
    amount: float
    shareAmount: Optional[float] = None
    date: str  # ISO 8601, e.g. 2026-08-21T09:12:00.000Z
    source: str
    isBusiness: bool = False
    isTransfer: bool = False
    isSplit: bool = False
