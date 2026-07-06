import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Fuel } from 'lucide-react';
import { authFetch } from '../context/FleetContext';

export type FuelTimeMode = 'day' | 'week' | 'month' | 'custom';

export interface FuelEntry { time: string; level: number }
export interface FuelSeries {
  assetId: string;
  regNo: string;
  assetName: string;
  zone: string;
  data: FuelEntry[];
}

export const FUEL_ZONE_COLORS: Record<string, string> = {
  'NORTH QUARRY': '#0078D4',
  'SOUTH PLANT': '#16a34a',
  'WEST DEPOT': '#7C3AED',
};

export const QUARRY_SITE_KEYS = ['WEST DEPOT', 'NORTH QUARRY', 'SOUTH PLANT'] as const;
export type QuarrySiteKey = typeof QUARRY_SITE_KEYS[number];

export const QUARRY_SITE_LABELS: Record<QuarrySiteKey, string> = {
  'WEST DEPOT': 'West Depot',
  'NORTH QUARRY': 'North Quarry',
  'SOUTH PLANT': 'South Plant',
};

const PERIOD_LABELS: Record<Exclude<FuelTimeMode, 'custom'>, string> = {
  day: 'Today',
  week: '7 Days',
  month: '30 Days',
};

export function fuelZoneColor(zone: string) {
  return FUEL_ZONE_COLORS[zone?.toUpperCase()] ?? '#6B7A8D';
}

function defaultCustomRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function bucketMinutes(mode: FuelTimeMode, customFrom: string, customTo: string) {
  if (mode !== 'custom') {
    return { day: 5, week: 60, month: 1440 }[mode];
  }
  const from = new Date(customFrom);
  const to = new Date(customTo);
  const days = Math.max(1, (to.getTime() - from.getTime()) / 86_400_000);
  if (days <= 2) return 5;
  if (days <= 14) return 60;
  return 1440;
}

function formatAxisTime(t: string, mode: FuelTimeMode) {
  const d = new Date(t);
  if (mode === 'day') {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });
  }
  if (mode === 'week') {
    return d.toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Africa/Lagos' });
}

function buildChartPoints(series: FuelSeries, bucketMin: number) {
  const bucketMs = bucketMin * 60_000;
  const buckets = new Map<number, { ts: number; level: number }>();
  series.data.forEach(pt => {
    const ts = new Date(pt.time).getTime();
    const b = Math.floor(ts / bucketMs) * bucketMs;
    const level = Math.max(0, pt.level);
    const existing = buckets.get(b);
    if (!existing || ts >= existing.ts) {
      buckets.set(b, { ts, level });
    }
  });
  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([bucketStart, pt]) => ({
      time: new Date(bucketStart).toISOString(),
      level: pt.level,
    }));
}

function latestReading(series: FuelSeries): number {
  if (!series.data.length) return 0;
  const sorted = [...series.data].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );
  return Math.max(0, sorted[sorted.length - 1].level);
}

function historyUrl(mode: FuelTimeMode, customFrom: string, customTo: string) {
  if (mode === 'custom' && customFrom && customTo) {
    return `/api/fuel/history?from=${encodeURIComponent(customFrom)}&to=${encodeURIComponent(customTo)}`;
  }
  return `/api/fuel/history?period=${mode}`;
}

interface Props {
  selectedRegNo: string | null;
  zone: QuarrySiteKey;
  onSeriesLoaded?: (series: FuelSeries[]) => void;
}

export default function FuelChart({ selectedRegNo, zone, onSeriesLoaded }: Props) {
  const [timeMode, setTimeMode] = useState<FuelTimeMode>('day');
  const [customRange, setCustomRange] = useState(defaultCustomRange);
  const [allSeries, setAllSeries] = useState<FuelSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<string | null>(null);

  const color = fuelZoneColor(zone);
  const bucketMin = useMemo(
    () => bucketMinutes(timeMode, customRange.from, customRange.to),
    [timeMode, customRange.from, customRange.to],
  );
  const axisMode: FuelTimeMode = timeMode === 'custom'
    ? (bucketMin <= 5 ? 'day' : bucketMin <= 60 ? 'week' : 'month')
    : timeMode;

  const load = useCallback(async (silent = false) => {
    if (timeMode === 'custom' && (!customRange.from || !customRange.to)) return;
    if (!silent) setLoading(true);
    try {
      const res = await authFetch(historyUrl(timeMode, customRange.from, customRange.to));
      if (res.ok) {
        const data: FuelSeries[] = await res.json();
        data.forEach(s => {
          s.data = s.data.map(pt => ({ ...pt, level: Math.max(0, pt.level) }));
        });
        setAllSeries(data);
        onSeriesLoaded?.(data);
        setLastFetch(new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos' }));
      }
    } catch { /* ignore */ }
    if (!silent) setLoading(false);
  }, [timeMode, customRange.from, customRange.to, onSeriesLoaded]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(() => load(true), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const activeSeries = allSeries.find(s => s.regNo === selectedRegNo);
  const chartData = activeSeries ? buildChartPoints(activeSeries, bucketMin) : [];
  const headerLevel = chartData.length
    ? chartData[chartData.length - 1].level
    : activeSeries
      ? latestReading(activeSeries)
      : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 420 }}>
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--cd-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Fuel size={15} color={color} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cd-text)', fontFamily: 'var(--cd-font-display)' }}>
            Fuel trend
          </span>
          {lastFetch && (
            <span style={{ fontSize: 11, color: 'var(--cd-text-muted)' }}>· updated {lastFetch}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 3, background: 'var(--cd-surface-2)', padding: 3, borderRadius: 8 }}>
            {(['day', 'week', 'month', 'custom'] as FuelTimeMode[]).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setTimeMode(p)}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: timeMode === p ? 'var(--cd-surface)' : 'transparent',
                  color: timeMode === p ? 'var(--cd-text)' : 'var(--cd-text-muted)',
                  boxShadow: timeMode === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {p === 'custom' ? 'Custom' : PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          {timeMode === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <input
                type="date"
                value={customRange.from}
                max={customRange.to}
                onChange={e => setCustomRange(r => ({ ...r, from: e.target.value }))}
                style={{
                  padding: '4px 8px', borderRadius: 6, border: '1px solid var(--cd-border)',
                  background: 'var(--cd-surface)', color: 'var(--cd-text)', fontSize: 12,
                }}
              />
              <span style={{ color: 'var(--cd-text-muted)' }}>→</span>
              <input
                type="date"
                value={customRange.to}
                min={customRange.from}
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => setCustomRange(r => ({ ...r, to: e.target.value }))}
                style={{
                  padding: '4px 8px', borderRadius: 6, border: '1px solid var(--cd-border)',
                  background: 'var(--cd-surface)', color: 'var(--cd-text)', fontSize: 12,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px 16px 12px' }}>
        {!selectedRegNo ? (
          <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cd-text-muted)', fontSize: 13 }}>
            Select a vehicle from the list
          </div>
        ) : loading ? (
          <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cd-text-muted)', fontSize: 13 }}>
            Loading…
          </div>
        ) : !activeSeries || chartData.length === 0 ? (
          <div style={{ height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Fuel size={32} color="var(--cd-border)" />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cd-text-muted)' }}>No fuel history for this period</div>
            <div style={{ fontSize: 12, color: 'var(--cd-text-muted)' }}>{selectedRegNo}</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 20, fontWeight: 700, color, fontFamily: 'var(--cd-font-display)' }}>{activeSeries.regNo}</span>
                <span style={{ fontSize: 12, color: 'var(--cd-text-muted)', marginLeft: 8 }}>{activeSeries.assetName}</span>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--cd-text)', fontFamily: 'var(--cd-font-display)', lineHeight: 1 }}>
                  {headerLevel.toFixed(0)}
                  <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--cd-text-muted)', marginLeft: 3 }}>L</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--cd-text-muted)', marginTop: 2 }}>Current level</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--cd-border)" />
                <XAxis
                  dataKey="time"
                  tickFormatter={t => formatAxisTime(t, axisMode)}
                  tick={{ fontSize: 11, fill: 'var(--cd-text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={v => `${v}L`}
                  tick={{ fontSize: 11, fill: 'var(--cd-text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                  width={46}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--cd-surface)', border: '1px solid var(--cd-border)', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={t => formatAxisTime(t, axisMode)}
                  formatter={(v: number) => [`${parseFloat(String(v)).toFixed(0)}L`, 'Fuel Level']}
                />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
