# Ledgerflow

A personal expense tracker: a React dashboard for reviewing, tagging, and
splitting transactions, backed by a small FastAPI service.

```
.
├── frontend/   React + TypeScript + Tailwind CSS dashboard (Create React App)
└── backend/    FastAPI + SQLModel API
```

## Frontend

```bash
cd frontend
npm install
npm start        # http://localhost:3000
```

See [`frontend/README.md`](frontend/README.md) for the full CRA script
reference.

## Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001   # http://localhost:8001
```

See [`backend/README.md`](backend/README.md) for the API contract, storage
model, and Render deploy steps.

## Wiring them together

The frontend's `API_BASE_URL` (in `frontend/src/constants.ts`) currently
points at a placeholder host. Point it at `http://localhost:8001/api` for
local development, or at wherever you deploy the backend in production —
if that's the exact placeholder host already in `constants.ts`, no frontend
change is needed at all.
