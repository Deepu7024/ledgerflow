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
| POST   | `/api/agent/sync-mail`    | —                                                              | Mail-reading agent — see below |

`GET /` is a plain health check.

## The mail-reading agent

`POST /api/agent/sync-mail` fetches recent Gmail messages, asks Claude to
classify each one (is this a transaction notification?) and, if so, extract
the merchant/amount/category, then inserts a `Transaction` with
`source: "Email"` for every real match. Already-seen message IDs are tracked
in a `ProcessedEmail` table so re-running the sync never double-inserts.

This is a single classification+extraction call per email
(`client.messages.parse` with a Pydantic `output_format`) — not an
open-ended agent loop — which is the right amount of machinery for "read
this email, tell me if it's a charge."

### One-time setup

**1. Google Cloud — enable Gmail API + get OAuth credentials**

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com/).
2. **APIs & Services → Library** → enable the **Gmail API**.
3. **APIs & Services → OAuth consent screen** → set it up for **External** +
   **Testing** mode (this is a personal tool, not a published app) and add
   your own Google account under **Test users**.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   → Application type **Desktop app**.
5. Download the client JSON and save it as `backend/credentials.json`
   (already gitignored — never commit this file).

**2. Authorize once, locally**

```bash
cd backend
source .venv/bin/activate
python scripts/gmail_auth.py
```

This opens a browser window for you to sign in and approve **read-only**
Gmail access, then writes `backend/token.json` (also gitignored). The
backend reads and auto-refreshes this token on every sync — you shouldn't
need to run this again unless the file is deleted or you revoke access.

**3. Anthropic API key**

```bash
# backend/.env (create this file — gitignored)
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com/).

### Triggering a sync

Either `curl -X POST http://localhost:8001/api/agent/sync-mail`, or the
**Sync from Mail** button in the frontend header. Response shape:

```json
{ "scanned": 12, "already_processed": 3, "added": 2, "skipped": 10, "errors": [] }
```

### Configuration (optional, all in `backend/.env`)

| Variable | Default | Meaning |
|---|---|---|
| `GMAIL_CREDENTIALS_FILE` | `credentials.json` | Path to the downloaded OAuth client JSON |
| `GMAIL_TOKEN_FILE` | `token.json` | Where the authorized token is stored |
| `GMAIL_QUERY` | `newer_than:14d` | Gmail search query scoping which messages are candidates |
| `MAIL_SYNC_MAX_RESULTS` | `25` | Cap on messages considered per sync call (bounds latency + API cost) |

### Cost note

Each new email costs one Claude API call (`claude-opus-5`, ~1K output
tokens max). At the default cap of 25 messages per sync, a single sync is
at most 25 calls — already-processed messages are skipped before any call
is made, so repeated syncs of the same mailbox cost nothing extra.

## Run it locally

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8001
```

The first run creates `ledgerflow.db` (SQLite) next to `app/` and seeds it
with the same demo rows as the frontend's own `SEED_TRANSACTIONS` fallback.
Delete the file to reset.

Point the frontend at it by setting `API_BASE_URL` in
`frontend/src/constants.ts` to `http://localhost:8001/api`.

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
    main.py          FastAPI app, CORS, lifespan (create tables + seed), loads backend/.env
    models.py        Category / Source enums, Transaction + ProcessedEmail tables
    schemas.py        Request bodies: ManualExpenseInput, ExpenseUpdate
    database.py       Engine/session setup
    seed.py            Demo rows, mirrors the frontend's SEED_TRANSACTIONS
    mail/
      gmail_client.py  OAuth token load/refresh, list + fetch messages
      extractor.py      Claude classification+extraction per email
    routers/
      expenses.py      The three expense routes above
      agent.py          POST /api/agent/sync-mail
  scripts/
    gmail_auth.py      One-time interactive Gmail OAuth (run manually, once)
  requirements.txt
```

## CORS

`main.py` currently allows every origin (`allow_origins=["*"]`) to keep
local development friction-free. Narrow this to your deployed frontend's
actual origin before this goes anywhere real.
