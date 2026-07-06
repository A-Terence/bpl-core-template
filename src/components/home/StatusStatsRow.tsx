import { useMemo } from 'react';
import {
  Truck, Navigation, Clock, MapPin, ParkingCircle, WifiOff, Ban, AlertTriangle, Fuel, Route,
} from 'lucide-react';
import { useFleet, type StatusFilter } from '../../context/FleetContext';
import PeriodSelect, { type PeriodValue } from './PeriodSelect';
import WidgetStatGraphic from './WidgetStatGraphic';

export type MetricPeriod = Exclude<PeriodValue, 'custom'>;

const STATUS_STATS = [
  {
    key: 'totalVehicles' as const,
    label: 'Total',
    filter: 'All' as StatusFilter,
    color: '#7c3aed',
    icon: Truck,
    graphicSrc: '/assets/vehicles/heavy-truck.svg',
    tooltip: 'Total number of vehicles in the fleet',
  },
  {
    key: 'moving' as const,
    label: 'Moving',
    filter: 'Moving' as StatusFilter,
    color: '#16a34a',
    icon: Navigation,
    tooltip: 'Vehicle is actively travelling above 5 km/h',
  },
  {
    key: 'idle' as const,
    label: 'Idle',
    filter: 'Idle' as StatusFilter,
    color: '#d97706',
    icon: Clock,
    tooltip: 'Vehicle is idling',
  },
  {
    key: 'stationary' as const,
    label: 'Stationary',
    filter: 'Stationary' as StatusFilter,
    color: '#0d9488',
    icon: MapPin,
    tooltip: 'Vehicle has been stationary for less than 1 hour',
  },
  {
    key: 'parked' as const,
    label: 'Parked',
    filter: 'Parked' as StatusFilter,
    color: '#ea580c',
    icon: ParkingCircle,
    tooltip: 'Vehicle has been stationary for between 1 and 24 hours',
  },
  {
    key: 'offline' as const,
    label: 'Offline',
    filter: 'Offline' as StatusFilter,
    color: '#64748b',
    icon: WifiOff,
    tooltip: 'Vehicle has not moved in over 24 hours',
  },
  {
    key: 'inactive' as const,
    label: 'Non-Operational',
    filter: 'Inactive' as StatusFilter,
    color: '#2563eb',
    icon: Ban,
    tooltip: 'Vehicle has not moved in over 30 days',
  },
  {
    key: 'panic' as const,
    label: 'Panic',
    filter: 'All' as StatusFilter,
    color: '#c8102e',
    icon: AlertTriangle,
    tooltip: 'Vehicle has an active panic alert',
    isPanic: true,
  },
];

function periodMult(period: MetricPeriod) {
  if (period === 'day') return 0.14;
  if (period === 'month') return 4.3;
  return 1;
}

interface Props {
  statusFilter: StatusFilter;
  onFilterChange: (f: StatusFilter) => void;
  metricPeriod: MetricPeriod;
  onMetricPeriodChange: (p: MetricPeriod) => void;
}

export default function StatusStatsRow({
  statusFilter,
  onFilterChange,
  metricPeriod,
  onMetricPeriodChange,
}: Props) {
  const { metadata, totalDistanceKm, fuelSeries } = useFleet();

  const { totalFuel, totalDistance } = useMemo(() => {
    const mult = periodMult(metricPeriod);
    const baseFuel = fuelSeries.reduce((s, d) => s + d.liters, 0);
    return {
      totalFuel: Math.round(baseFuel * mult),
      totalDistance: Math.round(totalDistanceKm * mult),
    };
  }, [fuelSeries, totalDistanceKm, metricPeriod]);

  const getValue = (key: typeof STATUS_STATS[number]['key']) => {
    if (key === 'totalVehicles') return metadata.totalVehicles;
    return metadata[key];
  };

  return (
    <div className="bpl-status-stats-layout">
      <div className="bpl-status-stats-grid">
        {STATUS_STATS.map(stat => {
          const Icon = stat.icon;
          const value = getValue(stat.key);
          const isActive = !stat.isPanic && (
            stat.filter === 'All' ? statusFilter === 'All' : statusFilter === stat.filter
          );
          const pct = !stat.isPanic && stat.filter !== 'All' && metadata.totalVehicles > 0
            ? Math.round((value / metadata.totalVehicles) * 100)
            : null;

          return (
            <button
              key={stat.key}
              type="button"
              title={stat.tooltip}
              className={`bpl-card bpl-status-stat${isActive ? ' active' : ''}`}
              style={{
                borderTopColor: stat.color,
                cursor: stat.isPanic ? 'default' : 'pointer',
                background: isActive ? `${stat.color}10` : undefined,
                outline: isActive ? `1.5px solid ${stat.color}40` : 'none',
              }}
              onClick={() => {
                if (!stat.isPanic) onFilterChange(stat.filter);
              }}
            >
              <div className="bpl-status-stat-inner">
                <div className="bpl-status-stat-copy">
                  <span className="bpl-status-stat-label">{stat.label}</span>
                  <div
                    className="bpl-status-stat-value"
                    style={{
                      color: stat.color,
                      animation: stat.isPanic && value > 0 ? 'pulse 1.5s infinite' : 'none',
                    }}
                  >
                    {value}
                  </div>
                  <div className="bpl-status-stat-sub">
                    {pct !== null ? `${pct}% of fleet` : stat.isPanic ? 'active alerts' : 'vehicles'}
                  </div>
                </div>
                <WidgetStatGraphic
                  color={stat.color}
                  icon={Icon}
                  graphicSrc={stat.graphicSrc}
                  graphicAlt={stat.label}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="bpl-status-metrics-col">
        <div className="bpl-card bpl-status-stat bpl-status-metric-card" style={{ borderTopColor: '#f97316' }}>
          <div className="bpl-status-stat-inner">
            <div className="bpl-status-stat-copy">
              <span className="bpl-status-stat-label">Total Fuel Used</span>
              <div className="bpl-status-stat-value" style={{ color: '#f97316' }}>
                {totalFuel.toLocaleString()}
                <span className="bpl-status-metric-unit">L</span>
              </div>
              <div className="bpl-status-stat-sub">
                <PeriodSelect value={metricPeriod} onChange={p => onMetricPeriodChange(p as MetricPeriod)} />
              </div>
            </div>
            <WidgetStatGraphic color="#f97316" icon={Fuel} />
          </div>
        </div>

        <div className="bpl-card bpl-status-stat bpl-status-metric-card" style={{ borderTopColor: '#8b5cf6' }}>
          <div className="bpl-status-stat-inner">
            <div className="bpl-status-stat-copy">
              <span className="bpl-status-stat-label">Total Distance</span>
              <div className="bpl-status-stat-value" style={{ color: '#8b5cf6' }}>
                {totalDistance.toLocaleString()}
                <span className="bpl-status-metric-unit">km</span>
              </div>
              <div className="bpl-status-stat-sub">
                <PeriodSelect value={metricPeriod} onChange={p => onMetricPeriodChange(p as MetricPeriod)} />
              </div>
            </div>
            <WidgetStatGraphic color="#8b5cf6" icon={Route} />
          </div>
        </div>
      </div>
    </div>
  );
}
