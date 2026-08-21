import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from google import genai
from sqlmodel import Session, select

from app.database import get_session
from app.mail.extractor import extract_expense
from app.mail.gmail_client import GmailNotAuthorizedError, get_gmail_service, get_message, list_message_ids
from app.models import Category, ProcessedEmail, Transaction

router = APIRouter(prefix="/agent", tags=["agent"])

DEFAULT_QUERY = os.getenv("GMAIL_QUERY", "newer_than:14d")
DEFAULT_MAX_RESULTS = int(os.getenv("MAIL_SYNC_MAX_RESULTS", "25"))


@router.post("/sync-mail")
def sync_mail(session: Session = Depends(get_session)):
    """
    Fetch recent emails, ask Gemini to classify+extract each one, and insert
    a Transaction (source="Email") for anything that looks like a real
    charge. Already-seen message IDs (per ProcessedEmail) are skipped
    without re-fetching or re-classifying them.
    """
    try:
        service = get_gmail_service()
    except GmailNotAuthorizedError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    try:
        gemini_client = genai.Client()
    except ValueError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Gemini client not configured: {exc} Set GEMINI_API_KEY in backend/.env.",
        ) from exc

    candidate_ids = list_message_ids(service, DEFAULT_QUERY, DEFAULT_MAX_RESULTS)
    already_seen = set(
        session.exec(
            select(ProcessedEmail.message_id).where(ProcessedEmail.message_id.in_(candidate_ids))
        ).all()
    )
    new_ids = [mid for mid in candidate_ids if mid not in already_seen]

    added = 0
    skipped = 0
    errors: list[str] = []
    now = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")

    for message_id in new_ids:
        try:
            email = get_message(service, message_id)
            extracted = extract_expense(gemini_client, email.subject, email.sender, email.body_text)

            if extracted.is_transaction and extracted.merchant and extracted.amount:
                category_value = extracted.category.value if extracted.category else Category.OTHER.value
                transaction = Transaction(
                    merchant=extracted.merchant,
                    amount=extracted.amount,
                    category=category_value,
                    source="Email",
                    date=email.received_at,
                    isBusiness=extracted.is_business,
                )
                session.add(transaction)
                session.add(
                    ProcessedEmail(
                        message_id=message_id,
                        is_transaction=True,
                        transaction_id=transaction.id,
                        processed_at=now,
                    )
                )
                added += 1
            else:
                session.add(
                    ProcessedEmail(
                        message_id=message_id,
                        is_transaction=False,
                        skipped_reason="not a recognized transaction",
                        processed_at=now,
                    )
                )
                skipped += 1
        except Exception as exc:  # noqa: BLE001 — one bad email shouldn't fail the whole sync
            errors.append(f"{message_id}: {exc}")

    session.commit()

    return {
        "scanned": len(new_ids),
        "already_processed": len(candidate_ids) - len(new_ids),
        "added": added,
        "skipped": skipped,
        "errors": errors,
    }
