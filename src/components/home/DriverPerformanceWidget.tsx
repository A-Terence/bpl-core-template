import { Link } from 'react-router-dom';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useFleet } from '../../context/FleetContext';

const DEFAULT_AVATAR = '/assets/default-avatar.svg';

export default function DriverPerformanceWidget() {
  const { drivers } = useFleet();

  return (
    <div className="bpl-card bpl-home-panel-card">
      <div className="bpl-card-header">
        <span className="bpl-card-title">Driver Performance</span>
        <Link to="/drivers" className="bpl-card-link">See all</Link>
      </div>
      <div className="bpl-card-body">
        {drivers.map(d => (
          <Link key={d.name} to="/drivers" className="bpl-driver-row bpl-widget-row-link">
            <img src={DEFAULT_AVATAR} alt="" className="bpl-driver-avatar-img" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: 'var(--cd-text-muted)' }}>Safety score</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--cd-font-display)' }}>{d.score}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                {d.trend === 'up' && <TrendingUp size={14} color="#16a34a" />}
                {d.trend === 'down' && <TrendingDown size={14} color="#CC0000" />}
                {d.trend === 'stable' && <Minus size={14} color="var(--cd-text-muted)" />}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
