from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Transaction
from app.schemas import ExpenseUpdate, ManualExpenseInput

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("", response_model=list[Transaction])
def list_expenses(session: Session = Depends(get_session)):
    """GET /api/expenses — every transaction, newest first."""
    statement = select(Transaction).order_by(Transaction.date.desc())
    return session.exec(statement).all()


@router.post("/manual", response_model=Transaction, status_code=201)
def create_manual_expense(
    payload: ManualExpenseInput, session: Session = Depends(get_session)
):
    """POST /api/expenses/manual — log a cash (or other manual) expense."""
    transaction = Transaction(
        merchant=payload.merchant,
        amount=payload.amount,
        category=payload.category.value,
        source="Cash" if payload.isCashEntry else "SMS",
        date=datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
    )
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return transaction


@router.patch("/{expense_id}", response_model=Transaction)
def update_expense(
    expense_id: str, payload: ExpenseUpdate, session: Session = Depends(get_session)
):
    """
    PATCH /api/expenses/{id} — partial update used for the tag toggle
    (personal / business / internal transfer) and split-share edits.
    """
    transaction = session.get(Transaction, expense_id)
    if transaction is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(transaction, field, value)

    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return transaction
