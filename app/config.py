from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    APP_NAME: str = "Pipeline API"
    DATABASE_URL: str = "sqlite+aiosqlite:///./pipeline.db"
    UPLOAD_DIR: str = str(Path(__file__).parent.parent / "uploads")
    GENERATED_DIR: str = str(Path(__file__).parent.parent / "generated")
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    class Config:
        env_file = ".env"

settings = Settings()
