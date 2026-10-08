from fastapi import APIRouter
from backend.models.schemas import DashboardSummarySchema
from backend.services.model_service import model_service

router = APIRouter(prefix="/api/model-comparison", tags=["Model Comparison"])

@router.get("", response_model=DashboardSummarySchema)
def get_model_comparison():
    return model_service.get_model_comparison()
