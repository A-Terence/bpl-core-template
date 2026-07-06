import type { IncidentType, SafeIQAnalysis, SafetyNotification } from '../hooks/useSafeIQ';
import {
  formatReferenceForDisplay,
  formatReferenceForPrompt,
  lookupSafetyReference,
  type SafetyReference,
} from '../data/safetyReferences';
import { fetchIncidentEnvironment } from './environment';
import { authFetch } from '../context/FleetContext';
import type { FleetEvent, FleetVehicle } from '../context/FleetContext';

export const SAFEIQ_LABELS = [
  'Harsh Braking',
  'Harsh Acceleration',
  'Overspeeding',
  'Overspeed Tiered',
  'Excessive Idling',
] as const;

export interface DriverStats {
  incidents: number;
  trend: 'improving' | 'stable' | 'declining';
}

export function isRelevantSafeIQEvent(event: FleetEvent): boolean {
  if (event.type === 'panic') return true;
  return SAFEIQ_LABELS.includes((event.label || '') as (typeof SAFEIQ_LABELS)[number]);
}

export function isRecentEvent(event: FleetEvent, maxAgeMs = 10 * 60 * 1000): boolean {
  const age = Date.now() - new Date(event.eventTime).getTime();
  return age < maxAgeMs;
}

export function getDriverStats(allEvents: FleetEvent[], driverName?: string): DriverStats {
  if (!driverName || driverName === 'N/A') return { incidents: 0, trend: 'stable' };

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const eventTime = (e: FleetEvent) => new Date(e.eventTime).getTime();

  const driverEvents = allEvents.filter(
    e => e.driverName === driverName && eventTime(e) >= thirtyDaysAgo,
  );
  const prevEvents = allEvents.filter(e => {
    const t = eventTime(e);
    return e.driverName === driverName && t >= thirtyDaysAgo - 30 * 24 * 60 * 60 * 1000 && t < thirtyDaysAgo;
  });

  const trend =
    driverEvents.length < prevEvents.length
      ? 'improving'
      : driverEvents.length > prevEvents.length
        ? 'declining'
        : 'stable';

  return { incidents: driverEvents.length, trend };
}

export function nextAnalysisThreshold(last: number): number {
  return last === 0 ? 3 : last * 2;
}

export function incidentTypeFromEvent(event: FleetEvent): IncidentType {
  if (event.type === 'panic') return 'harsh_braking';
  if (event.label === 'Overspeeding' || event.label === 'Overspeed Tiered') return 'speeding';
  if (event.label === 'Harsh Acceleration') return 'harsh_acceleration';
  if (event.label === 'Excessive Idling') return 'excessive_idling';
  return 'harsh_braking';
}

export function buildSafetyNotification(
  event: FleetEvent,
  stats: DriverStats,
  _vehicle?: FleetVehicle,
): SafetyNotification {
  const scoreBaseline = Math.max(35, Math.min(100, 100 - stats.incidents * 3));
  return {
    id: event.eventId,
    type: incidentTypeFromEvent(event),
    magnitude: event.label || 'Unknown',
    timestamp: event.eventTime,
    location: event.address || '',
    eventCount: stats.incidents,
    driver: {
      id: event.assetId || event.regNo || 'unknown',
      name: event.driverName || 'Unknown Driver',
      safety_score_baseline: scoreBaseline,
      incidents_last_30_days: stats.incidents,
      improvement_trend: stats.trend,
    },
    vehicle: {
      id: event.regNo || event.assetId || 'unknown',
      type: 'truck',
      last_maintenance: '',
    },
    environment: {
      weather: 'Loading…',
      traffic_density: 'moderate',
      road_type: 'highway',
    },
    analysis: null,
    analysisLoading: true,
  };
}

export function buildFallbackAnalysis(
  ref: SafetyReference,
  event: FleetEvent,
  stats: DriverStats,
): SafeIQAnalysis {
  const isPanic = event.type === 'panic';
  const severity =
    isPanic || stats.incidents >= 8 ? 'RED' : stats.incidents >= 4 ? 'YELLOW' : 'GREEN';

  return {
    severity,
    severity_reason: isPanic
      ? `Panic activation requires immediate supervisor response per FRSC Emergency Response Protocol.`
      : `${event.label || 'Safety event'} recorded for ${event.driverName || 'driver'} (${stats.incidents} incidents in 30 days).`,
    root_cause: ref.coaching,
    industry_reference: formatReferenceForDisplay(ref),
    coaching_recommendation: ref.coaching,
    ops_flag: isPanic || stats.incidents >= 8,
    ops_flag_reason:
      isPanic
        ? 'Panic event — supervisor contact required within 1 hour.'
        : stats.incidents >= 8
          ? `Driver crossed intervention threshold (${stats.incidents} incidents / 30 days; guideline: ${ref.threshold ?? 'review required'}).`
          : '',
  };
}

export async function analyzeSafetyEvent(
  event: FleetEvent,
  stats: DriverStats,
  vehicle?: FleetVehicle,
): Promise<{ environment: SafetyNotification['environment']; analysis: SafeIQAnalysis | null }> {
  const latitude = event.latitude ?? vehicle?.latitude ?? null;
  const longitude = event.longitude ?? vehicle?.longitude ?? null;

  const environment = await fetchIncidentEnvironment({
    latitude: latitude != null && !Number.isNaN(Number(latitude)) ? Number(latitude) : null,
    longitude: longitude != null && !Number.isNaN(Number(longitude)) ? Number(longitude) : null,
    address: event.address,
    timestamp: event.eventTime,
  });

  const ref = lookupSafetyReference(event.label, event.type);
  const safetyReference = ref ? formatReferenceForPrompt(ref) : null;

  try {
    const aiRes = await authFetch('/api/ai/safeiq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: {
          label: event.label,
          type: event.type,
          driverName: event.driverName,
          regNo: event.regNo,
          assetId: event.assetId,
          address: event.address,
          eventTime: event.eventTime,
          eventId: event.eventId,
        },
        driverIncidents30Days: stats.incidents,
        driverTrend: stats.trend,
        environment,
        safetyReference,
      }),
    });

    if (aiRes.ok) {
      const analysis: SafeIQAnalysis = await aiRes.json();
      return { environment, analysis };
    }
  } catch {
    /* fall through to local FRSC reference */
  }

  if (ref) {
    return { environment, analysis: buildFallbackAnalysis(ref, event, stats) };
  }

  return { environment, analysis: null };
}

export interface DriverAnalysisState {
  lastThreshold: number;
  notifId: string;
}

export function selectEventsForAnalysis(
  newEvents: FleetEvent[],
  allEvents: FleetEvent[],
  driverAnalysis: Map<string, DriverAnalysisState>,
): { toAnalyse: FleetEvent[]; countUpdates: { notifId: string; eventCount: number; driverName: string }[] } {
  const toAnalyse: FleetEvent[] = [];
  const countUpdates: { notifId: string; eventCount: number; driverName: string }[] = [];

  newEvents.forEach(event => {
    const driverKey = event.driverName || event.assetId || event.eventId;
    const stats = getDriverStats(allEvents, event.driverName);
    const driverState = driverAnalysis.get(driverKey);
    const threshold = nextAnalysisThreshold(driverState?.lastThreshold ?? 0);

    if (stats.incidents >= threshold) {
      toAnalyse.push(event);
      driverAnalysis.set(driverKey, {
        lastThreshold: stats.incidents,
        notifId: event.eventId,
      });
    } else if (driverState?.notifId) {
      countUpdates.push({
        notifId: driverState.notifId,
        eventCount: stats.incidents,
        driverName: event.driverName || '',
      });
    }
  });

  return { toAnalyse, countUpdates };
}
