from typing import Dict, Any
from backend.config import (
    MATHEMATICAL_THRESHOLD,
    ISOLATION_FOREST_ESTIMATORS,
    ISOLATION_FOREST_CONTAM,
    ISOLATION_FOREST_SEED,
)
from backend.services.analytics_service import analytics_service

class ModelService:
    def get_model_comparison(self) -> Dict[str, Any]:
        return analytics_service.get_dashboard_summary()

    def get_model_config(self) -> Dict[str, Any]:
        return {
            "estimators": ISOLATION_FOREST_ESTIMATORS,
            "contamination": ISOLATION_FOREST_CONTAM,
            "randomState": ISOLATION_FOREST_SEED,
            "mathThreshold": MATHEMATICAL_THRESHOLD,
        }

model_service = ModelService()
