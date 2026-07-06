import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { computeFleetScore } from '../lib/fleetScore';

const API_SECRET = import.meta.env.VITE_API_SECRET as string | undefined;

export const authFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(API_SECRET ? { 'x-api-secret': API_SECRET } : {}),
    },
  });

export type VehicleStatus =
  | 'Moving'
  | 'Idle'
  | 'Excessive Idle'
  | 'Stationary'
  | 'Parked'
  | 'Inactive'
  | 'Offline';

export type StatusFilter =
  | 'All'
  | 'Moving'
  | 'Idle'
  | 'Excessive Idle'
  | 'Stationary'
  | 'Parked'
  | 'Offline'
  | 'Inactive';

export interface FleetVehicle {
  id: string;
  regNo: string;
  assetName: string;
  transporter: string;
  site: string;
  zone?: string;
  status: VehicleStatus;
  driverName: string;
  driverPhone?: string;
  address: string;
  date: string;
  panic: boolean;
  fuelLevel?: { level: number };
  latitude?: number;
  longitude?: number;
}

export interface FleetEvent {
  eventId: string;
  label: string;
  type?: string;
  driverName?: string;
  driverPhone?: string;
  regNo?: string;
  assetId?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  eventTime: string;
}

export interface FleetMetadata {
  totalVehicles: number;
  moving: number;
  idle: number;
  excessiveIdle: number;
  stationary: number;
  parked: number;
  inactive: number;
  offline: number;
  panic: number;
  lastUpdate: string;
}

export interface AlertItem {
  id: string;
  label: string;
  vehicle: string;
  time: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface DriverScore {
  name: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

export interface MaintenanceItem {
  vehicle: string;
  assetName: string;
  service: string;
  due: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface FuelDay {
  day: string;
  liters: number;
}

export interface AiInsight {
  id: string;
  title: string;
  description: string;
  type: 'fuel' | 'safety' | 'route' | 'maintenance';
}

export interface TripItem {
  id: string;
  vehicle: string;
  driver: string;
  route: string;
  timing: 'On Time' | 'Delayed' | 'Completed';
  status: 'Ongoing' | 'Completed';
  progress: number;
  eta: string;
}

export type HosStatus = 'compliant' | 'warning' | 'violation';

export interface HosRecord {
  id: string;
  driverName: string;
  vehicleReg: string;
  site: string;
  driveMinutesToday: number;
  dutyMinutesToday: number;
  driveLimitMinutes: number;
  dutyLimitMinutes: number;
  restMinutesRemaining: number;
  status: HosStatus;
  restDueAt: string | null;
  lastUpdated: string;
}

const now = Date.now();

function demoFuelLevel(regNo: string) {
  let h = 0;
  for (let i = 0; i < regNo.length; i++) h = (h + regNo.charCodeAt(i) * (i + 1)) % 100;
  return 35 + (h % 55);
}

export const DEMO_VEHICLES: FleetVehicle[] = [
  { id: '1', regNo: 'FLT-0042', assetName: 'Volvo FH16', transporter: 'Acme Logistics', site: 'North Quarry', zone: 'NORTH QUARRY', status: 'Moving', driverName: 'Alex Morgan', driverPhone: '+1 555 010 0042', address: 'Highway 12 KM 47', date: new Date(now - 120000).toISOString(), panic: false, fuelLevel: { level: demoFuelLevel('FLT-0042') } },
  { id: '2', regNo: 'FLT-0017', assetName: 'Mercedes Actros', transporter: 'Beta Haulage', site: 'West Depot', zone: 'WEST DEPOT', status: 'Idle', driverName: 'Jordan Lee', driverPhone: '+1 555 010 0017', address: 'Industrial Park Rd', date: new Date(now - 300000).toISOString(), panic: false, fuelLevel: { level: demoFuelLevel('FLT-0017') } },
  { id: '3', regNo: 'FLT-0033', assetName: 'MAN TGS', transporter: 'Acme Logistics', site: 'North Quarry', zone: 'NORTH QUARRY', status: 'Moving', driverName: 'Sam Rivera', driverPhone: '+1 555 010 0033', address: 'County Route 8', date: new Date(now - 60000).toISOString(), panic: false, fuelLevel: { level: demoFuelLevel('FLT-0033') } },
  { id: '4', regNo: 'FLT-0081', assetName: 'Scania R450', transporter: 'Gamma Transport', site: 'South Plant', zone: 'SOUTH PLANT', status: 'Parked', driverName: 'Casey Brooks', driverPhone: '+1 555 010 0081', address: 'Central Depot', date: new Date(now - 900000).toISOString(), panic: true, fuelLevel: { level: demoFuelLevel('FLT-0081') } },
  { id: '5', regNo: 'FLT-0055', assetName: 'Isuzu FTR', transporter: 'Acme Logistics', site: 'West Depot', zone: 'WEST DEPOT', status: 'Stationary', driverName: 'Taylor Reed', driverPhone: '+1 555 010 0055', address: 'Riverside Ave', date: new Date(now - 450000).toISOString(), panic: false, fuelLevel: { level: demoFuelLevel('FLT-0055') } },
  { id: '6', regNo: 'FLT-0024', assetName: 'Hino 500', transporter: 'Delta Fleet', site: 'South Plant', zone: 'SOUTH PLANT', status: 'Offline', driverName: 'Morgan Ellis', address: '—', date: new Date(now - 86400000).toISOString(), panic: false, fuelLevel: { level: demoFuelLevel('FLT-0024') } },
  { id: '7', regNo: 'FLT-0067', assetName: 'DAF XF', transporter: 'Acme Logistics', site: 'North Quarry', zone: 'NORTH QUARRY', status: 'Excessive Idle', driverName: 'Riley Chen', driverPhone: '+1 555 010 0067', address: 'Milltown', date: new Date(now - 180000).toISOString(), panic: false, fuelLevel: { level: demoFuelLevel('FLT-0067') } },
  { id: '8', regNo: 'FLT-0092', assetName: 'Ford Cargo', transporter: 'Beta Haulage', site: 'West Depot', zone: 'WEST DEPOT', status: 'Inactive', driverName: 'Jamie Park', driverPhone: '+1 555 010 0092', address: '—', date: new Date(now - 86400000 * 35).toISOString(), panic: false, fuelLevel: { level: demoFuelLevel('FLT-0092') } },
];

export const DEMO_EVENTS: FleetEvent[] = [
  {
    eventId: 'demo-ev-recent-001',
    label: 'Harsh Braking',
    driverName: 'Alex Morgan',
    regNo: 'FLT-0042',
    assetId: '1',
    address: 'Highway 12 KM 47',
    eventTime: new Date(Date.now() - 120000).toISOString(),
  },
  {
    eventId: 'demo-ev-recent-002',
    label: 'Harsh Braking',
    driverName: 'Alex Morgan',
    regNo: 'FLT-0042',
    assetId: '1',
    address: 'Highway 12 KM 52',
    eventTime: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    eventId: 'demo-ev-recent-003',
    label: 'Harsh Acceleration',
    driverName: 'Alex Morgan',
    regNo: 'FLT-0042',
    assetId: '1',
    address: 'Route 9 Interchange',
    eventTime: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    eventId: 'demo-ev-002',
    label: 'Overspeeding',
    driverName: 'Casey Brooks',
    regNo: 'FLT-0081',
    assetId: '4',
    address: 'Expressway North',
    eventTime: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    eventId: 'demo-ev-003',
    label: 'Harsh Braking',
    driverName: 'Jordan Lee',
    regNo: 'FLT-0017',
    assetId: '2',
    eventTime: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    eventId: 'demo-ev-panic-001',
    type: 'panic',
    label: 'Panic',
    driverName: 'Casey Brooks',
    regNo: 'FLT-0081',
    assetId: '4',
    address: 'Central Depot',
    eventTime: new Date(Date.now() - 60000).toISOString(),
  },
];

const DEMO_METADATA: FleetMetadata = {
  totalVehicles: DEMO_VEHICLES.length,
  moving: DEMO_VEHICLES.filter(v => v.status === 'Moving').length,
  idle: DEMO_VEHICLES.filter(v => v.status === 'Idle').length,
  excessiveIdle: DEMO_VEHICLES.filter(v => v.status === 'Excessive Idle').length,
  stationary: DEMO_VEHICLES.filter(v => v.status === 'Stationary').length,
  parked: DEMO_VEHICLES.filter(v => v.status === 'Parked').length,
  inactive: DEMO_VEHICLES.filter(v => v.status === 'Inactive').length,
  offline: DEMO_VEHICLES.filter(v => v.status === 'Offline').length,
  panic: DEMO_VEHICLES.filter(v => v.panic).length,
  lastUpdate: new Date().toISOString(),
};

const DEMO_ALERTS: AlertItem[] = [
  { id: '1', label: 'Harsh Braking Detected', vehicle: 'FLT-0042', time: '2m ago', severity: 'warning' },
  { id: '2', label: 'Maintenance Due Soon', vehicle: 'FLT-0017', time: '15m ago', severity: 'info' },
  { id: '3', label: 'Fuel Level Low', vehicle: 'FLT-0033', time: '32m ago', severity: 'warning' },
  { id: '4', label: 'Panic Alert', vehicle: 'FLT-0081', time: '1m ago', severity: 'critical' },
];

const DEMO_DRIVERS: DriverScore[] = [
  { name: 'Sam Rivera', score: 94, trend: 'up' },
  { name: 'Morgan Ellis', score: 91, trend: 'stable' },
  { name: 'Taylor Reed', score: 89, trend: 'up' },
  { name: 'Alex Morgan', score: 43, trend: 'down' },
];

const DEMO_MAINTENANCE: MaintenanceItem[] = [
  { vehicle: 'FLT-0042', assetName: 'Volvo FH16', service: '10,000 km Service', due: 'Due in 3 days', urgency: 'high' },
  { vehicle: 'FLT-0017', assetName: 'Mercedes Actros', service: 'Brake Inspection', due: 'Due in 7 days', urgency: 'medium' },
  { vehicle: 'FLT-0055', assetName: 'Isuzu FTR', service: 'Tyre Rotation', due: 'Due in 14 days', urgency: 'low' },
];

const DEMO_FUEL: FuelDay[] = [
  { day: 'Mon', liters: 320 },
  { day: 'Tue', liters: 280 },
  { day: 'Wed', liters: 350 },
  { day: 'Thu', liters: 310 },
  { day: 'Fri', liters: 290 },
  { day: 'Sat', liters: 180 },
  { day: 'Sun', liters: 120 },
];

const DEMO_INSIGHTS: AiInsight[] = [
  { id: '1', title: 'High Fuel Consumption', description: '3 vehicles consumed 22% above fleet average this week.', type: 'fuel' },
  { id: '2', title: 'Route Optimization', description: 'Alternate route via A2 could save 12 km daily for quarry haulage.', type: 'route' },
  { id: '3', title: 'Driver Coaching', description: '2 drivers crossed the 8-incident threshold — review recommended.', type: 'safety' },
];

const DEMO_TRIPS: TripItem[] = [
  { id: '1', vehicle: 'FLT-0042', driver: 'Alex Morgan', route: 'North Quarry → Central Depot', timing: 'On Time', status: 'Ongoing', progress: 72, eta: '14:30' },
  { id: '2', vehicle: 'FLT-0033', driver: 'Sam Rivera', route: 'Quarry → East Terminal', timing: 'Delayed', status: 'Ongoing', progress: 45, eta: '15:10' },
  { id: '3', vehicle: 'FLT-0017', driver: 'Jordan Lee', route: 'West Depot → South Plant', timing: 'On Time', status: 'Ongoing', progress: 88, eta: '13:45' },
  { id: '4', vehicle: 'FLT-0055', driver: 'Taylor Reed', route: 'Hub → North Quarry', timing: 'Completed', status: 'Completed', progress: 100, eta: '12:00' },
];

const DEMO_HOS: HosRecord[] = [
  { id: '1', driverName: 'Alex Morgan', vehicleReg: 'FLT-0042', site: 'North Quarry', driveMinutesToday: 312, dutyMinutesToday: 410, driveLimitMinutes: 540, dutyLimitMinutes: 720, restMinutesRemaining: 38, status: 'warning', restDueAt: new Date(Date.now() + 38 * 60_000).toISOString(), lastUpdated: new Date().toISOString() },
  { id: '2', driverName: 'Jordan Lee', vehicleReg: 'FLT-0017', site: 'West Depot', driveMinutesToday: 186, dutyMinutesToday: 240, driveLimitMinutes: 540, dutyLimitMinutes: 720, restMinutesRemaining: 195, status: 'compliant', restDueAt: new Date(Date.now() + 195 * 60_000).toISOString(), lastUpdated: new Date().toISOString() },
  { id: '3', driverName: 'Sam Rivera', vehicleReg: 'FLT-0033', site: 'North Quarry', driveMinutesToday: 498, dutyMinutesToday: 615, driveLimitMinutes: 540, dutyLimitMinutes: 720, restMinutesRemaining: 0, status: 'violation', restDueAt: null, lastUpdated: new Date().toISOString() },
  { id: '4', driverName: 'Casey Brooks', vehicleReg: 'FLT-0081', site: 'South Plant', driveMinutesToday: 94, dutyMinutesToday: 120, driveLimitMinutes: 540, dutyLimitMinutes: 720, restMinutesRemaining: 360, status: 'compliant', restDueAt: new Date(Date.now() + 360 * 60_000).toISOString(), lastUpdated: new Date().toISOString() },
  { id: '5', driverName: 'Taylor Reed', vehicleReg: 'FLT-0055', site: 'West Depot', driveMinutesToday: 268, dutyMinutesToday: 355, driveLimitMinutes: 540, dutyLimitMinutes: 720, restMinutesRemaining: 72, status: 'warning', restDueAt: new Date(Date.now() + 72 * 60_000).toISOString(), lastUpdated: new Date().toISOString() },
  { id: '6', driverName: 'Riley Chen', vehicleReg: 'FLT-0067', site: 'North Quarry', driveMinutesToday: 142, dutyMinutesToday: 188, driveLimitMinutes: 540, dutyLimitMinutes: 720, restMinutesRemaining: 280, status: 'compliant', restDueAt: new Date(Date.now() + 280 * 60_000).toISOString(), lastUpdated: new Date().toISOString() },
  { id: '7', driverName: 'Jamie Park', vehicleReg: 'FLT-0092', site: 'West Depot', driveMinutesToday: 521, dutyMinutesToday: 680, driveLimitMinutes: 540, dutyLimitMinutes: 720, restMinutesRemaining: 0, status: 'violation', restDueAt: null, lastUpdated: new Date().toISOString() },
];

export type DataSource = 'demo' | 'live';

interface FleetContextValue {
  dataSource: DataSource;
  metadata: FleetMetadata;
  vehicles: FleetVehicle[];
  events: FleetEvent[];
  alerts: AlertItem[];
  drivers: DriverScore[];
  maintenance: MaintenanceItem[];
  fuelSeries: FuelDay[];
  insights: AiInsight[];
  trips: TripItem[];
  hosRecords: HosRecord[];
  safetyScore: number;
  safetyDelta: number;
  redAlertCount: number;
  totalDistanceKm: number;
  fuelEfficiency: number;
  environment: { weather: string; traffic: string; temp: string };
  reloadEvents: () => void;
}

const FleetContext = createContext<FleetContextValue | null>(null);

function mapLiveVehicle(v: Record<string, unknown>): FleetVehicle {
  const pos = v.position as { latitude?: number; longitude?: number; address?: string } | undefined;
  return {
    id: String(v.id ?? ''),
    regNo: String(v.regNo ?? ''),
    assetName: String(v.assetName ?? ''),
    transporter: String(v.transporter ?? ''),
    site: String(v.site ?? ''),
    zone: v.zone as string | undefined,
    status: (v.status as VehicleStatus) || 'Offline',
    driverName: String(v.driverName ?? 'N/A'),
    driverPhone: v.driverPhone != null ? String(v.driverPhone) : undefined,
    address: String(pos?.address ?? v.address ?? '—'),
    date: String(v.date ?? new Date().toISOString()),
    panic: Boolean(v.panic),
    fuelLevel: v.fuelLevel as FleetVehicle['fuelLevel'],
    latitude: pos?.latitude,
    longitude: pos?.longitude,
  };
}

function mapLiveEvent(e: Record<string, unknown>): FleetEvent {
  return {
    eventId: String(e.eventId ?? e.id ?? `${e.regNo}-${e.eventTime}`),
    label: String(e.label ?? e.eventType ?? 'Unknown'),
    type: e.type as string | undefined,
    driverName: e.driverName as string | undefined,
    driverPhone: e.driverPhone as string | undefined,
    regNo: e.regNo as string | undefined,
    assetId: e.assetId != null ? String(e.assetId) : undefined,
    address: e.address as string | undefined,
    latitude: e.latitude as number | null | undefined,
    longitude: e.longitude as number | null | undefined,
    eventTime: String(e.eventTime ?? e.timestamp ?? new Date().toISOString()),
  };
}

export function FleetProvider({ children }: { children: ReactNode }) {
  const [dataSource, setDataSource] = useState<DataSource>('demo');
  const [metadata, setMetadata] = useState<FleetMetadata>(DEMO_METADATA);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>(DEMO_VEHICLES);
  const [events, setEvents] = useState<FleetEvent[]>(DEMO_EVENTS);

  const loadMetadata = useCallback(async () => {
    try {
      const res = await authFetch('/api/metadata');
      if (!res.ok) return false;
      setMetadata(await res.json());
      setDataSource('live');
      return true;
    } catch {
      return false;
    }
  }, []);

  const loadVehicles = useCallback(async () => {
    try {
      const res = await authFetch('/api/data');
      if (!res.ok) return;
      const data = (await res.json()) as Record<string, unknown>[];
      setVehicles(data.filter(v => v.site !== 'XN - Decommissioned').map(mapLiveVehicle));
      setDataSource('live');
    } catch {
      /* demo fallback */
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const res = await authFetch('/api/events/log');
      if (!res.ok) return;
      const data = (await res.json()) as Record<string, unknown>[];
      setEvents(data.map(mapLiveEvent));
      setDataSource('live');
    } catch {
      /* demo fallback */
    }
  }, []);

  const reloadEvents = useCallback(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    void loadMetadata();
    void loadVehicles();
    void loadEvents();

    const metaInterval = setInterval(loadMetadata, 10_000);
    const vehicleInterval = setInterval(loadVehicles, 10_000);
    const eventInterval = setInterval(loadEvents, 15_000);

    return () => {
      clearInterval(metaInterval);
      clearInterval(vehicleInterval);
      clearInterval(eventInterval);
    };
  }, [loadMetadata, loadVehicles, loadEvents]);

  const { score: safetyScore, delta: safetyDelta } = useMemo(
    () => computeFleetScore(events, vehicles.length),
    [events, vehicles.length],
  );

  const value = useMemo<FleetContextValue>(() => ({
    dataSource,
    metadata,
    vehicles,
    events,
    alerts: DEMO_ALERTS,
    drivers: DEMO_DRIVERS,
    maintenance: DEMO_MAINTENANCE,
    fuelSeries: DEMO_FUEL,
    insights: DEMO_INSIGHTS,
    trips: DEMO_TRIPS,
    hosRecords: DEMO_HOS,
    safetyScore,
    safetyDelta,
    redAlertCount: metadata.panic,
    totalDistanceKm: 12842,
    fuelEfficiency: 6.2,
    environment: { weather: 'Partly cloudy', traffic: 'Moderate', temp: '28°C' },
    reloadEvents,
  }), [dataSource, metadata, vehicles, events, safetyScore, safetyDelta, reloadEvents]);

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error('useFleet must be used within FleetProvider');
  return ctx;
}
