export type IncidentType = 'harsh_braking' | 'harsh_acceleration' | 'speeding' | 'excessive_idling';
export type Severity = 'RED' | 'YELLOW' | 'GREEN';

export interface DriverContext {
  id: string;
  name: string;
  safety_score_baseline: number;
  incidents_last_30_days: number;
  improvement_trend: 'improving' | 'stable' | 'declining';
}

export interface VehicleContext {
  id: string;
  type: 'truck' | 'tanker' | 'van';
  last_maintenance: string;
  make?: string;
  model?: string;
}

export interface EnvironmentContext {
  weather: string;
  weather_condition?: string;
  temperature_c?: number;
  humidity_pct?: number;
  precipitation_mm?: number;
  traffic_density: 'light' | 'moderate' | 'heavy';
  traffic_description?: string;
  current_speed_kmh?: number;
  free_flow_speed_kmh?: number;
  traffic_delay_pct?: number;
  road_type: 'highway' | 'urban' | 'rural';
  environment_source?: { weather: string; traffic: string };
}

export interface SafeIQAnalysis {
  severity: Severity;
  severity_reason: string;
  root_cause: string;
  industry_reference: string;
  coaching_recommendation: string;
  ops_flag: boolean;
  ops_flag_reason: string;
}

export interface SafetyNotification {
  id: string;
  type: IncidentType;
  magnitude: string;
  timestamp: string;
  location: string;
  driver: DriverContext;
  vehicle: VehicleContext;
  environment: EnvironmentContext;
  analysis: SafeIQAnalysis | null;
  analysisLoading: boolean;
  eventCount: number;
}
