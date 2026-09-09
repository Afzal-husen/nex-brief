"""Application Configuration."""
import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# Load environment variables from backend/.env if present
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings(BaseModel):
    PROJECT_NAME: str = "NexBrief API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))

    # Database
    DATABASE_URL: str = Field(
        default_factory=lambda: os.getenv("DATABASE_URL", "sqlite:///backend/data/nexbrief.db")
    )

    # CORS
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ])

    @property
    def database_url(self) -> str:
        return self.DATABASE_URL

    model_config = {
        "extra": "ignore"
    }


settings = Settings()
