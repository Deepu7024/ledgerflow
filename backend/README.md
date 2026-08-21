# Ledgerflow API

A small FastAPI backend for the Ledgerflow expense tracker. It implements
exactly the three endpoints `frontend/src/api.ts` expects, with response
shapes matching `frontend/src/types.ts` field-for-field (camelCase JSON,
no translation layer needed on either side).

## Endpoints

| Method | Path                      | Body                                                        | Notes |
|--------|---------------------------|--------------------------------------------------------------|-------|
| GET    | `/api/expenses`           | —                                                              | All transactions, newest first |
| POST   | `/api/expenses/manual`    | `{ merchant, amount, category, isCashEntry }`                 | Logs a manual/cash expense |
| PATCH  | `/api/expenses/{id}`      | any of `{ isBusiness, isTransfer, isSplit, shareAmount }`      | Tag toggle + split-share edits |

`GET /` is a plain health check.

## Run it locally

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

The first run creates `ledgerflow.db` (SQLite) next to `app/` and seeds it
with the same demo rows as the frontend's own `SEED_TRANSACTIONS` fallback.
Delete the file to reset.

Point the frontend at it by setting `API_BASE_URL` in
`frontend/src/constants.ts` to `http://localhost:8000/api`.

## Storage

- **Dev:** SQLite file (`DATABASE_URL` defaults to `sqlite:///./ledgerflow.db`).
- **Prod:** set `DATABASE_URL` to a Postgres connection string — a free-tier
  Render web service's disk is ephemeral, so SQLite there gets wiped on
  every redeploy. `sqlmodel`/SQLAlchemy needs no code changes, just the URL.

## Deploying to Render

1. New **Web Service**, root directory `backend/`.
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Attach a Render Postgres instance and set `DATABASE_URL` to its connection string.
5. If you deploy this to the exact host already referenced in
   `frontend/src/constants.ts` (`your-backend.onrender.com`), the frontend
   needs no changes at all.

## Project layout

```
backend/
  app/
    main.py          FastAPI app, CORS, lifespan (create tables + seed)
    models.py        Category / Source enums, the Transaction table model
    schemas.py        Request bodies: ManualExpenseInput, ExpenseUpdate
    database.py       Engine/session setup
    seed.py            Demo rows, mirrors the frontend's SEED_TRANSACTIONS
    routers/
      expenses.py      The three routes above
  requirements.txt
```

## CORS

`main.py` currently allows every origin (`allow_origins=["*"]`) to keep
local development friction-free. Narrow this to your deployed frontend's
actual origin before this goes anywhere real.
