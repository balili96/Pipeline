from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    APP_NAME: str = "Pipeline API"
    
    # Supabase PostgreSQL (set via Vercel env vars)
    DATABASE_URL: str = "sqlite+aiosqlite:///./pipeline.db"
    
    # Supabase credentials (set via Vercel env vars)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "pipeline-docs"
    
    # File upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    class Config:
        env_file = ".env"

settings = Settings()
