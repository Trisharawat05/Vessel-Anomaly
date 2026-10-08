from typing import Dict, Any, List, Optional, Tuple
from backend.services.data_service import data_service

class AnomalyService:
    def get_anomalies(
        self,
        mmsi: Optional[str] = None,
        vessel_type: Optional[str] = None,
        detection_status: Optional[str] = "all",
        page: int = 1,
        page_size: int = 10,
        sort_by: str = "mlScore",
        sort_order: str = "desc",
    ) -> Tuple[List[Dict[str, Any]], int, int]:
        # Filter for candidates only (not normal)
        filtered_status = detection_status if detection_status and detection_status != "all" else None
        
        data, total, total_pages = data_service.get_vessels(
            mmsi=mmsi,
            vessel_type=vessel_type,
            detection_status=filtered_status,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        if not filtered_status:
            # Exclude normal observations
            data_candidates = [v for v in data if v["detectionStatus"] != "normal"]
            return data_candidates, total, total_pages

        return data, total, total_pages

    def get_anomaly_by_id(self, anomaly_id: str) -> Optional[Dict[str, Any]]:
        # Check if anomaly_id is MMSI number or id
        try:
            mmsi = int(anomaly_id.replace("obs-", "").split("-")[0])
            return data_service.get_vessel_by_mmsi(mmsi)
        except ValueError:
            return None

anomaly_service = AnomalyService()
