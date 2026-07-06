import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useFleet } from '../../context/FleetContext';

const COLORS: Record<string, string> = {
  Moving: '#16a34a',
  Parked: '#7C3AED',
  Idle: '#d97706',
  Offline: '#64748b',
};

const FILTER_MAP: Record<string, string> = {
  Moving: 'Moving',
  Parked: 'Parked',
  Idle: 'Idle',
  Offline: 'Offline',
};

export default function VehicleStatusWidget() {
  const { metadata } = useFleet();
  const data = [
    { name: 'Moving', value: metadata.moving },
    { name: 'Parked', value: metadata.parked },
    { name: 'Idle', value: metadata.idle },
    { name: 'Offline', value: metadata.offline + metadata.inactive },
  ].filter(d => d.value > 0);

  return (
    <div className="bpl-card" style={{ height: '100%' }}>
      <div className="bpl-card-header">
        <span className="bpl-card-title">Vehicle Status</span>
        <Link to="/fleet" className="bpl-card-link">See all</Link>
      </div>
      <div className="bpl-card-body">
        <div className="bpl-donut-layout">
          <div className="bpl-donut-chart">
            <ResponsiveContainer width="100%" height={146}>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map(d => (
                    <Cell key={d.name} fill={COLORS[d.name]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="bpl-donut-center">
              <div className="bpl-donut-total">{metadata.totalVehicles}</div>
              <div className="bpl-donut-label">vehicles</div>
            </div>
          </div>
          <div className="bpl-donut-legend">
            {data.map(d => (
              <Link
                key={d.name}
                to={`/fleet?status=${FILTER_MAP[d.name] ?? d.name}`}
                className="bpl-donut-legend-item"
              >
                <span className="bpl-donut-legend-dot" style={{ background: COLORS[d.name] }} />
                <span className="bpl-donut-legend-name">{d.name}</span>
                <span className="bpl-donut-legend-value">{d.value}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
