from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.models.schemas import PaginatedVesselsResponseSchema, VesselObservationSchema
from backend.services.anomaly_service import anomaly_service

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])

@router.get("", response_model=PaginatedVesselsResponseSchema)
def get_anomalies(
    mmsi: Optional[str] = Query(None, description="Search by MMSI"),
    vessel_type: Optional[str] = Query(None, description="Filter by vessel type"),
    detection_status: Optional[str] = Query("all", description="Candidate filter: all, math_candidate, ml_candidate, both_models"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("mlScore", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sorting direction: asc or desc"),
):
    data, total, total_pages = anomaly_service.get_anomalies(
        mmsi=mmsi,
        vessel_type=vessel_type,
        detection_status=detection_status,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return {
        "data": data,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": total_pages,
    }

@router.get("/{anomaly_id}", response_model=VesselObservationSchema)
def get_anomaly_by_id(anomaly_id: str):
    obs = anomaly_service.get_anomaly_by_id(anomaly_id)
    if not obs:
        raise HTTPException(status_code=404, detail=f"Anomaly observation '{anomaly_id}' not found.")
    return obs
