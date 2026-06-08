from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")

if is_sqlite:
    # SQLite for local dev
    db_url = settings.DATABASE_URL.replace("+aiosqlite", "").replace("sqlite+asyncpg", "sqlite")
    engine = create_engine(db_url, echo=False, connect_args={"check_same_thread": False})
else:
    # PostgreSQL for production (Supabase)
    db_url = settings.DATABASE_URL.replace("+asyncpg", "").replace("+aiosqlite", "")
    if "sslmode" not in db_url:
        db_url += "?sslmode=require"
    engine = create_engine(db_url, echo=False, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app.models import project, task, document  # noqa
    Base.metadata.create_all(bind=engine)
