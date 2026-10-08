from fastapi import APIRouter
from backend.models.schemas import DashboardSummarySchema
from backend.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummarySchema)
def get_dashboard_summary():
    return analytics_service.get_dashboard_summary()
