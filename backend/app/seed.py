"""
Demo data mirroring frontend/src/constants.ts's SEED_TRANSACTIONS, so the
dashboard shows the same rows whether it's talking to the real backend or
falling back to its own local seed.
"""
from sqlmodel import Session, select

from app.models import Transaction

SEED_TRANSACTIONS = [
    Transaction(
        id="tx_1", merchant="Blue Tokai Coffee", category="Food & Dining",
        amount=640, date="2026-08-19T09:12:00.000Z", source="PhonePe",
    ),
    Transaction(
        id="tx_2", merchant="Netflix", category="Entertainment",
        amount=649, date="2026-08-18T00:00:00.000Z", source="SMS",
        isSplit=True, shareAmount=325,
    ),
    Transaction(
        id="tx_3", merchant="AWS", category="Business",
        amount=4820, date="2026-08-17T14:30:00.000Z", source="SMS",
        isBusiness=True,
    ),
    Transaction(
        id="tx_4", merchant="Local Kirana Store", category="Groceries",
        amount=1120, date="2026-08-17T11:00:00.000Z", source="Cash",
    ),
    Transaction(
        id="tx_5", merchant="Transfer to Savings", category="Personal",
        amount=15000, date="2026-08-16T08:00:00.000Z", source="PhonePe",
        isTransfer=True,
    ),
    Transaction(
        id="tx_6", merchant="Zomato", category="Food & Dining",
        amount=480, date="2026-08-15T20:15:00.000Z", source="SMS",
    ),
    Transaction(
        id="tx_7", merchant="H&M", category="Shopping",
        amount=2799, date="2026-08-14T17:45:00.000Z", source="SMS",
    ),
    Transaction(
        id="tx_8", merchant="Indian Oil Petrol Pump", category="Travel",
        amount=1500, date="2026-08-13T07:30:00.000Z", source="Cash",
    ),
    Transaction(
        id="tx_9", merchant="Notion", category="Business",
        amount=799, date="2026-08-12T00:00:00.000Z", source="SMS",
        isBusiness=True,
    ),
    Transaction(
        id="tx_10", merchant="Apollo Pharmacy", category="Health",
        amount=340, date="2026-08-11T18:20:00.000Z", source="PhonePe",
    ),
    Transaction(
        id="tx_11", merchant="BESCOM Electricity", category="Utilities",
        amount=2150, date="2026-08-10T00:00:00.000Z", source="SMS",
    ),
    Transaction(
        id="tx_12", merchant="PVR Cinemas", category="Entertainment",
        amount=960, date="2026-08-09T21:00:00.000Z", source="PhonePe",
        isSplit=True, shareAmount=480,
    ),
]


def seed_if_empty(session: Session) -> None:
    existing = session.exec(select(Transaction)).first()
    if existing is not None:
        return
    for tx in SEED_TRANSACTIONS:
        session.add(tx)
    session.commit()
