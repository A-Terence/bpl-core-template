import { Truck, Navigation, Gauge, Fuel, Shield } from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { useTenant } from '../../context/TenantContext';

export default function KpiRow() {
  const { metadata, safetyScore, safetyDelta, totalDistanceKm, fuelEfficiency } = useFleet();
  const { isEnabled } = useTenant();

  const active = metadata.moving + metadata.idle + metadata.stationary;
  const activePct = metadata.totalVehicles
    ? Math.round((active / metadata.totalVehicles) * 100)
    : 0;

  const cards = [
    {
      label: 'Total Vehicles',
      value: metadata.totalVehicles,
      sub: <span className="bpl-kpi-delta-up">+8 vs last week</span>,
      icon: Truck,
      color: '#0078D4',
      bg: 'rgba(0,120,212,0.1)',
      show: true,
    },
    {
      label: 'Active Vehicles',
      value: active,
      sub: <>{activePct}% of fleet</>,
      icon: Navigation,
      color: '#16a34a',
      bg: 'rgba(22,163,74,0.1)',
      show: true,
    },
    {
      label: 'Total Distance',
      value: `${totalDistanceKm.toLocaleString()} km`,
      sub: <span className="bpl-kpi-delta-up">+5.2%</span>,
      icon: Gauge,
      color: '#0d9488',
      bg: 'rgba(13,148,136,0.1)',
      show: isEnabled('driverDistance'),
    },
    {
      label: 'Fuel Efficiency',
      value: `${fuelEfficiency} km/L`,
      sub: <span className="bpl-kpi-delta-up">+4.1%</span>,
      icon: Fuel,
      color: '#d97706',
      bg: 'rgba(217,119,6,0.1)',
      show: isEnabled('fuel'),
    },
    {
      label: 'Safety Score',
      value: `${safetyScore}/100`,
      sub: <span className="bpl-kpi-delta-up">+{safetyDelta} pts</span>,
      icon: Shield,
      color: '#7c3aed',
      bg: 'rgba(124,58,237,0.1)',
      show: isEnabled('safety'),
    },
  ].filter(c => c.show);

  return (
    <div className="bpl-kpi-row" style={{ gridTemplateColumns: `repeat(${Math.min(cards.length, 5)}, 1fr)` }}>
      {cards.map(c => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="bpl-kpi-card">
            <div className="bpl-kpi-icon" style={{ background: c.bg, color: c.color }}>
              <Icon size={18} />
            </div>
            <div className="bpl-kpi-label">{c.label}</div>
            <div className="bpl-kpi-value" style={{ fontSize: typeof c.value === 'number' ? undefined : '22px' }}>
              {c.value}
            </div>
            <div className="bpl-kpi-sub">{c.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
