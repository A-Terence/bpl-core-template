import type { EnvironmentContext } from '../hooks/useSafeIQ';

const TRAFFIC_COLORS = {
  light: '#16a34a',
  moderate: '#d97706',
  heavy: '#CC0000',
} as const;

export function formatEnvironmentLine(env: EnvironmentContext): string {
  const traffic = env.traffic_description || `${env.traffic_density.charAt(0).toUpperCase() + env.traffic_density.slice(1)} traffic`;
  const road = env.road_type.charAt(0).toUpperCase() + env.road_type.slice(1);
  return `${env.weather} · ${traffic} · ${road}`;
}

export default function EnvironmentBadge({ environment, compact }: { environment: EnvironmentContext; compact?: boolean }) {
  const trafficColor = TRAFFIC_COLORS[environment.traffic_density];

  if (compact) {
    return (
      <div className="bpl-env-badge-compact">
        {formatEnvironmentLine(environment)}
      </div>
    );
  }

  return (
    <div className="bpl-env-badge-grid">
      <div className="bpl-env-badge-cell">
        <div className="bpl-env-badge-label">Weather</div>
        <div className="bpl-env-badge-value">{environment.weather}</div>
      </div>
      <div className="bpl-env-badge-cell">
        <div className="bpl-env-badge-label">Traffic</div>
        <div className="bpl-env-badge-value" style={{ color: trafficColor }}>
          {environment.traffic_description || `${environment.traffic_density} traffic`}
        </div>
      </div>
      <div className="bpl-env-badge-cell">
        <div className="bpl-env-badge-label">Road Type</div>
        <div className="bpl-env-badge-value" style={{ textTransform: 'capitalize' }}>{environment.road_type}</div>
      </div>
    </div>
  );
}
