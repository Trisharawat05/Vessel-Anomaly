from fastapi import APIRouter
from backend.models.schemas import AnalyticsResponseSchema
from backend.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsResponseSchema)
def get_analytics():
    return analytics_service.get_analytics()
