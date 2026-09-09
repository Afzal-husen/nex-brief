"""Health check router."""
from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health_check():
    """Verify service availability."""
    return {"status": "ok", "service": "nexbrief-backend"}
