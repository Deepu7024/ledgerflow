from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from app.database import create_db_and_tables, engine
from app.routers import expenses
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


@app.get("/")
def health():
    return {"status": "ok", "service": "ledgerflow-api"}
