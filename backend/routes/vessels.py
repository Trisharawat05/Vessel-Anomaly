from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.models.schemas import PaginatedVesselsResponseSchema, VesselObservationSchema
from backend.services.data_service import data_service

router = APIRouter(prefix="/api/vessels", tags=["Vessels"])

@router.get("", response_model=PaginatedVesselsResponseSchema)
def get_vessels(
    mmsi: Optional[str] = Query(None, description="Search by partial or exact MMSI"),
    vessel_type: Optional[str] = Query(None, description="Filter by ship type"),
    nav_status: Optional[str] = Query(None, description="Filter by navigational status"),
    detection_status: Optional[str] = Query(None, description="Filter by candidate status: normal, ml_candidate, math_candidate, both_models"),
    sog_min: Optional[float] = Query(None, description="Minimum SOG speed"),
    sog_max: Optional[float] = Query(None, description="Maximum SOG speed"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("mlScore", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sorting direction: asc or desc"),
):
    data, total, total_pages = data_service.get_vessels(
        mmsi=mmsi,
        vessel_type=vessel_type,
        nav_status=nav_status,
        detection_status=detection_status,
        sog_min=sog_min,
        sog_max=sog_max,
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

@router.get("/{mmsi}", response_model=VesselObservationSchema)
def get_vessel_by_mmsi(mmsi: int):
    vessel = data_service.get_vessel_by_mmsi(mmsi)
    if not vessel:
        raise HTTPException(status_code=404, detail=f"Vessel with MMSI {mmsi} not found.")
    return vessel
