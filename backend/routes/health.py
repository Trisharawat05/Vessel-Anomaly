from fastapi import APIRouter
from backend.models.schemas import HealthResponseSchema
from backend.services.model_service import model_service

router = APIRouter(prefix="/api/health", tags=["System Health"])

@router.get("", response_model=HealthResponseSchema)
def get_health():
    config = model_service.get_model_config()

    endpoints = [
        {"name": "Summary Endpoint", "path": "/api/dashboard/summary", "status": "online"},
        {"name": "Vessels Endpoint", "path": "/api/vessels", "status": "online"},
        {"name": "Single Vessel Endpoint", "path": "/api/vessels/{mmsi}", "status": "online"},
        {"name": "Anomalies Endpoint", "path": "/api/anomalies", "status": "online"},
        {"name": "Single Anomaly Endpoint", "path": "/api/anomalies/{id}", "status": "online"},
        {"name": "Analytics Endpoint", "path": "/api/analytics", "status": "online"},
        {"name": "Model Comparison Endpoint", "path": "/api/model-comparison", "status": "online"},
        {"name": "Data Quality Endpoint", "path": "/api/data-quality", "status": "online"},
        {"name": "Health Endpoint", "path": "/api/health", "status": "online"}
    ]

    return {
        "frontendStatus": "operational",
        "apiStatus": "connected",
        "datasetStatus": "loaded",
        "featureEngineeringStatus": "available",
        "mathModelStatus": "available",
        "isolationForestStatus": "available",
        "modelConfig": {
            "estimators": config["estimators"],
            "contamination": config["contamination"],
            "randomState": config["randomState"],
        },
        "endpoints": endpoints
    }
