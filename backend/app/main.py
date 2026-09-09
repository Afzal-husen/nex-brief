"""NexBrief FastAPI Application Entry Point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.health import router as health_router
from backend.app.api.projects import router as projects_router
from backend.app.api.transcripts import router as transcripts_router
from backend.app.core.config import settings
from backend.app.core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize database schemas on startup."""
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(transcripts_router, prefix=settings.API_V1_STR)
