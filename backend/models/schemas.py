from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field

class VesselObservationSchema(BaseModel):
    id: str = Field(..., description="Unique observation identifier")
    mmsi: int = Field(..., description="Maritime Mobile Service Identity")
    vesselType: str = Field(..., description="Ship type classification")
    sog: Optional[float] = Field(None, description="Speed Over Ground (knots)")
    cog: Optional[float] = Field(None, description="Course Over Ground (degrees)")
    heading: Optional[float] = Field(None, description="Heading (degrees)")
    length: Optional[float] = Field(None, description="Vessel length (meters)")
    width: Optional[float] = Field(None, description="Vessel width (meters)")
    draught: Optional[float] = Field(None, description="Vessel draught (meters)")
    navStatus: str = Field(..., description="Declared navigational status")
    mathScore: Optional[float] = Field(None, description="Mathematical anomaly score [0.0 - 1.0]")
    mlScore: Optional[float] = Field(None, description="Isolation Forest anomaly score")
    detectionStatus: str = Field(..., description="normal | ml_candidate | math_candidate | both_models")
    headingCogDiff: Optional[float] = Field(None, description="Heading vs COG angular difference (degrees)")
    speedComponent: Optional[float] = Field(None, description="Speed anomaly component score")
    directionComponent: Optional[float] = Field(None, description="Direction anomaly component score")
    dimensionComponent: Optional[float] = Field(None, description="Dimension anomaly component score")
    missingFields: List[str] = Field(default_factory=list, description="Missing AIS attribute names")
    isDemoData: bool = Field(False, description="Flag indicating if observation is demo data")
    vesselObservationCount: Optional[int] = Field(1, description="Total observations for this MMSI in dataset")

class DashboardSummarySchema(BaseModel):
    totalObservations: int
    mlCandidates: int
    mathCandidates: int
    modelAgreement: int
    mlCandidateRate: float
    mathOnlyCandidates: int
    mlOnlyCandidates: int
    mathThreshold: float

class PaginatedVesselsResponseSchema(BaseModel):
    data: List[VesselObservationSchema]
    total: int
    page: int
    pageSize: int
    totalPages: int

class VesselTypeMetricSchema(BaseModel):
    type: str
    count: int
    candidateRate: float

class NavigationStatusMetricSchema(BaseModel):
    status: str
    count: int

class ScoreDistributionBinSchema(BaseModel):
    binRange: str
    binStart: float
    mathCount: int
    mlCount: int

class AnalyticsResponseSchema(BaseModel):
    vesselTypes: List[VesselTypeMetricSchema]
    navStatuses: List[NavigationStatusMetricSchema]
    scoreDistributions: List[ScoreDistributionBinSchema]

class DataQualityResponseSchema(BaseModel):
    totalObservations: int
    missingSog: int
    missingCog: int
    missingHeading: int
    missingWidth: int
    missingLength: int
    missingDraught: int
    incompleteObservations: int
    invalidHeadingRecords: int
    availableFeatures: List[str]
    limitationWarning: str

class ModelConfigSchema(BaseModel):
    estimators: int
    contamination: float
    randomState: int

class EndpointStatusSchema(BaseModel):
    name: str
    path: str
    status: str

class HealthResponseSchema(BaseModel):
    frontendStatus: str
    apiStatus: str
    datasetStatus: str
    featureEngineeringStatus: str
    mathModelStatus: str
    isolationForestStatus: str
    modelConfig: ModelConfigSchema
    endpoints: List[EndpointStatusSchema]
