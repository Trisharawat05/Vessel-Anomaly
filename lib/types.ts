export type DetectionStatus = 'normal' | 'ml_candidate' | 'math_candidate' | 'both_models';

export interface VesselObservation {
  id: string;
  mmsi: number;
  vesselType: string;
  sog: number | null; // Speed Over Ground (knots)
  cog: number | null; // Course Over Ground (degrees)
  heading: number | null; // Heading (degrees)
  length: number | null; // meters
  width: number | null; // meters
  draught: number | null; // meters
  navStatus: string;
  mathScore: number | null;
  mlScore: number | null;
  detectionStatus: DetectionStatus;
  headingCogDiff?: number | null;
  speedComponent?: number;
  directionComponent?: number;
  dimensionComponent?: number;
  missingFields?: string[];
  isDemoData?: boolean;
  vesselObservationCount?: number; // Total observations for this MMSI in dataset
}

export interface DashboardSummary {
  totalObservations: number;
  mlCandidates: number;
  mathCandidates: number;
  modelAgreement: number;
  mlCandidateRate: number; // Percentage (e.g. 1.00)
  mathOnlyCandidates: number;
  mlOnlyCandidates: number;
  mathThreshold: number;
}

export interface VesselTypeMetric {
  type: string;
  count: number;
  candidateRate: number; // percentage
}

export interface NavigationStatusMetric {
  status: string;
  count: number;
}

export interface ScoreDistributionBin {
  binRange: string;
  binStart: number;
  mathCount: number;
  mlCount: number;
}

export interface DataQualityMetrics {
  totalObservations: number;
  missingSog: number;
  missingCog: number;
  missingHeading: number;
  missingWidth: number;
  missingLength: number;
  missingDraught: number;
  incompleteObservations: number;
  invalidHeadingRecords: number;
  availableFeatures: string[];
  limitationWarning: string;
}

export interface ModelConfig {
  estimators: number;
  contamination: number;
  randomState: number;
}

export interface SystemStatus {
  frontendStatus: 'operational' | 'degraded' | 'down';
  apiStatus: 'connected' | 'disconnected';
  datasetStatus: 'loaded' | 'unloaded';
  featureEngineeringStatus: 'available' | 'unavailable';
  mathModelStatus: 'available' | 'unavailable';
  isolationForestStatus: 'available' | 'unavailable';
  modelConfig: ModelConfig;
  endpoints: {
    name: string;
    path: string;
    status: 'online' | 'offline' | 'mocked';
  }[];
}

export interface VesselFilterParams {
  mmsi?: string;
  vesselType?: string;
  navStatus?: string;
  sogMin?: number;
  sogMax?: number;
  detectionStatus?: DetectionStatus | 'all';
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedVesselsResponse {
  data: VesselObservation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
