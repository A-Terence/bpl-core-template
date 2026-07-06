import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useFleet } from '../../context/FleetContext';

export default function AiInsightsWidget() {
  const { insights } = useFleet();

  return (
    <div className="bpl-card bpl-home-panel-card">
      <div className="bpl-card-header">
        <span className="bpl-card-title">AI Insights</span>
        <Link to="/aria" className="bpl-card-link">See all</Link>
      </div>
      <div className="bpl-card-body">
        {insights.map(ins => (
          <Link key={ins.id} to="/aria" className="bpl-insight-item bpl-widget-row-link">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{ins.title}</div>
            <div style={{ fontSize: 12, color: 'var(--cd-text-muted)', lineHeight: 1.5 }}>{ins.description}</div>
          </Link>
        ))}
        <Link to="/aria" className="bpl-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}>
          <Sparkles size={16} />
          Ask AI Assistant
        </Link>
      </div>
    </div>
  );
}
