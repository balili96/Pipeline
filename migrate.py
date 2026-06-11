"""Create all tables in Supabase PostgreSQL.
Run: python migrate.py
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.ext.asyncio import create_async_engine
from app.database import Base
from app.models.project import Project
from app.models.task import Task
from app.models.document import Document

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:Balili0000%2A%40@db.tiiircotimeftvllqglv.supabase.co:6543/postgres"
)

async def migrate():
    engine = create_async_engine(DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("\n✅ Migration complete! All tables created.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(migrate())
