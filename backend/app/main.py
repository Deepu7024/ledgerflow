from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

# Must run before any of this project's own modules — several of them read
# GMAIL_*/ANTHROPIC_API_KEY as module-level constants at import time.
# An explicit path is deliberate: load_dotenv() with no path walks up parent
# directories looking for a ".env" and will happily load an unrelated one
# from somewhere above this repo (e.g. a home-directory .env from another
# project) — that's a real footgun, not a hypothetical one.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from app.database import create_db_and_tables, engine
from app.routers import agent, expenses
from app.seed import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    with Session(engine) as session:
        seed_if_empty(session)
    yield


app = FastAPI(title="Ledgerflow API", version="0.1.0", lifespan=lifespan)

# Wide open for local development. Narrow this to your deployed frontend's
# origin(s) before shipping this anywhere real.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(expenses.router, prefix="/api")
app.include_router(agent.router, prefix="/api")


@app.get("/")
def health():
    return {"status": "ok", "service": "ledgerflow-api"}
