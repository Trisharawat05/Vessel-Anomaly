import {
  DashboardSummary,
  VesselObservation,
  VesselTypeMetric,
  NavigationStatusMetric,
  DataQualityMetrics,
  SystemStatus,
  VesselFilterParams,
  PaginatedVesselsResponse,
  ScoreDistributionBin,
} from './types';
import {
  verifiedSummary,
  verifiedVesselTypeMetrics,
  verifiedNavStatusMetrics,
  verifiedDataQuality,
  defaultSystemStatus,
  verifiedScoreDistributions,
  sampleVesselObservations,
  verifiedMMSI219015871,
} from './mockData';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function isMockMode(): boolean {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('vessel_x_force_mock');
    if (override !== null) return override === 'true';
  }
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';
}

export function setMockModeOverride(enableMock: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vessel_x_force_mock', enableMock ? 'true' : 'false');
    window.location.reload();
  }
}

export class ApiError extends Error {
  status: number;
  endpoint: string;
  constructor(message: string, status: number = 500, endpoint: string = '') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

async function fetchFromBackend<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `Backend returned status ${response.status}: ${response.statusText}`,
        response.status,
        endpoint
      );
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Unable to connect to the analytics API at ${API_BASE_URL}${endpoint}.`,
      0,
      endpoint
    );
  }
}

// 1. Dashboard Summary
export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (isMockMode()) {
    return Promise.resolve(verifiedSummary);
  }
  return fetchFromBackend<DashboardSummary>('/api/dashboard/summary');
}

// 2. Paginated Vessels Explorer
export async function getVessels(
  params: VesselFilterParams = {}
): Promise<PaginatedVesselsResponse> {
  if (isMockMode()) {
    let filtered = [...sampleVesselObservations];

    if (params.mmsi) {
      const query = params.mmsi.trim();
      filtered = filtered.filter((v) => v.mmsi.toString().includes(query));
    }
    if (params.vesselType && params.vesselType !== 'all') {
      filtered = filtered.filter(
        (v) => v.vesselType.toLowerCase() === params.vesselType?.toLowerCase()
      );
    }
    if (params.navStatus && params.navStatus !== 'all') {
      filtered = filtered.filter(
        (v) => v.navStatus.toLowerCase() === params.navStatus?.toLowerCase()
      );
    }
    if (params.detectionStatus && params.detectionStatus !== 'all') {
      filtered = filtered.filter(
        (v) => v.detectionStatus === params.detectionStatus
      );
    }
    if (params.sogMin !== undefined) {
      filtered = filtered.filter((v) => (v.sog ?? 0) >= params.sogMin!);
    }
    if (params.sogMax !== undefined) {
      filtered = filtered.filter((v) => (v.sog ?? 0) <= params.sogMax!);
    }

    // Sort
    if (params.sortBy) {
      const key = params.sortBy as keyof VesselObservation;
      const order = params.sortOrder === 'desc' ? -1 : 1;
      filtered.sort((a, b) => {
        const valA = a[key] ?? 0;
        const valB = b[key] ?? 0;
        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
      });
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const data = filtered.slice(startIndex, startIndex + pageSize);

    return Promise.resolve({
      data,
      total,
      page,
      pageSize,
      totalPages,
    });
  }

  const queryParams = new URLSearchParams();
  if (params.mmsi) queryParams.set('mmsi', params.mmsi);
  if (params.vesselType) queryParams.set('vessel_type', params.vesselType);
  if (params.navStatus) queryParams.set('nav_status', params.navStatus);
  if (params.detectionStatus) queryParams.set('detection_status', params.detectionStatus);
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.pageSize) queryParams.set('page_size', params.pageSize.toString());
  if (params.sortBy) queryParams.set('sort_by', params.sortBy);
  if (params.sortOrder) queryParams.set('sort_order', params.sortOrder);

  return fetchFromBackend<PaginatedVesselsResponse>(`/api/vessels?${queryParams.toString()}`);
}

// 3. Single Vessel by MMSI
export async function getVessel(mmsi: number): Promise<VesselObservation | null> {
  if (isMockMode()) {
    if (mmsi === 219015871) return Promise.resolve(verifiedMMSI219015871);
    const found = sampleVesselObservations.find((v) => v.mmsi === mmsi);
    return Promise.resolve(found || null);
  }
  return fetchFromBackend<VesselObservation>(`/api/vessels/${mmsi}`);
}

// 4. Anomaly Candidates
export async function getAnomalies(
  params: VesselFilterParams = {}
): Promise<PaginatedVesselsResponse> {
  if (isMockMode()) {
    const candidatesOnly = sampleVesselObservations.filter(
      (v) => v.detectionStatus !== 'normal'
    );
    return getVessels({ ...params, detectionStatus: params.detectionStatus || 'all' }).then(
      (res) => ({
        ...res,
        data: res.data.filter((v) => v.detectionStatus !== 'normal'),
      })
    );
  }
  return fetchFromBackend<PaginatedVesselsResponse>('/api/anomalies');
}

// 5. Single Anomaly Observation by ID
export async function getAnomaly(id: string): Promise<VesselObservation | null> {
  if (isMockMode()) {
    const found = sampleVesselObservations.find((v) => v.id === id);
    return Promise.resolve(found || null);
  }
  return fetchFromBackend<VesselObservation>(`/api/anomalies/${id}`);
}

// 6. Analytics Datasets
export async function getAnalytics(): Promise<{
  vesselTypes: VesselTypeMetric[];
  navStatuses: NavigationStatusMetric[];
  scoreDistributions: ScoreDistributionBin[];
}> {
  if (isMockMode()) {
    return Promise.resolve({
      vesselTypes: verifiedVesselTypeMetrics,
      navStatuses: verifiedNavStatusMetrics,
      scoreDistributions: verifiedScoreDistributions,
    });
  }
  return fetchFromBackend('/api/analytics');
}

// 7. Model Comparison Data
export async function getModelComparison(): Promise<DashboardSummary> {
  return getDashboardSummary();
}

// 8. Data Quality Summary
export async function getDataQuality(): Promise<DataQualityMetrics> {
  if (isMockMode()) {
    return Promise.resolve(verifiedDataQuality);
  }
  return fetchFromBackend<DataQualityMetrics>('/api/data-quality');
}

// 9. System Status & Endpoint Health
export async function getSystemHealth(): Promise<SystemStatus> {
  if (isMockMode()) {
    return Promise.resolve(defaultSystemStatus);
  }
  try {
    const backendStatus = await fetchFromBackend<SystemStatus>('/api/health');
    return backendStatus;
  } catch (err) {
    return {
      ...defaultSystemStatus,
      apiStatus: 'disconnected',
      endpoints: defaultSystemStatus.endpoints.map((ep) => ({
        ...ep,
        status: 'offline',
      })),
    };
  }
}
