import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useFleet } from '../../context/FleetContext';

export default function FleetMapWidget() {
  const { metadata } = useFleet();

  return (
    <div className="bpl-card" style={{ height: '100%' }}>
      <div className="bpl-card-header">
        <span className="bpl-card-title">Fleet Overview</span>
        <Link to="/fleet" className="bpl-card-link">View all</Link>
      </div>
      <div className="bpl-card-body">
        <div className="bpl-map-placeholder">
          <MapPin size={32} style={{ opacity: 0.25, marginBottom: 8 }} />
          <div>Live map — connect MiX poller to populate</div>
          <div className="bpl-map-legend">
            <span><span style={{ color: '#16a34a' }}>●</span> Moving {metadata.moving}</span>
            <span><span style={{ color: '#0078D4' }}>●</span> Stopped {metadata.parked}</span>
            <span><span style={{ color: '#d97706' }}>●</span> Idle {metadata.idle}</span>
            <span><span style={{ color: '#64748b' }}>●</span> Offline {metadata.offline}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
