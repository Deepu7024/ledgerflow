"""
Turns one email's text into a structured expense (or a decision that it
isn't one) using Gemini — a single classification+extraction call per
email, no agentic tool loop needed for this shape of task.
"""
from typing import Optional

from google import genai
from google.genai import types
from pydantic import BaseModel

from app.models import Category

MODEL = "gemini-3.7-flash"

_CATEGORY_LIST = ", ".join(c.value for c in Category)

SYSTEM_PROMPT = f"""You classify emails for a personal expense tracker.

Given an email's subject, sender, and body, decide whether it is a \
transaction notification: a bank debit/credit alert, a UPI/PhonePe/card \
payment receipt, an order confirmation, or a subscription charge. \
Newsletters, marketing, OTPs, delivery updates with no charge, and \
statements/summaries (not a single transaction) are NOT transactions.

If it is a transaction, extract:
- merchant: the payee or service name, as a short human-readable name \
  (e.g. "Swiggy", "Amazon", "Uber") — not the raw sender address.
- amount: the transaction amount as a plain number, in the currency's \
  major unit (e.g. rupees, not paise). Use the amount actually charged, \
  not any account balance mentioned.
- category: exactly one of: {_CATEGORY_LIST}.
- is_business: true only if this is clearly a work/business expense \
  (e.g. cloud infrastructure, SaaS subscriptions for work, business travel) \
  rather than a personal one.

If it is not a transaction, or you cannot confidently determine both the \
merchant and the amount, set is_transaction to false and leave the other \
fields empty."""


class ExtractedExpense(BaseModel):
    is_transaction: bool
    merchant: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[Category] = None
    is_business: bool = False


def extract_expense(
    client: genai.Client, subject: str, sender: str, body_text: str
) -> ExtractedExpense:
    response = client.models.generate_content(
        model=MODEL,
        contents=f"Subject: {subject}\nFrom: {sender}\n\n{body_text}",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=ExtractedExpense,
        ),
    )
    if response.parsed is None:
        raise ValueError(f"Gemini returned no parseable output: {response.text!r}")
    return response.parsed
