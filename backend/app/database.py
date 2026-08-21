import os

from sqlmodel import Session, SQLModel, create_engine

# SQLite for local dev. Swap DATABASE_URL for a Postgres connection string
# in production — Render's free web-service disk is ephemeral, so a SQLite
# file there gets wiped on every redeploy.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ledgerflow.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
