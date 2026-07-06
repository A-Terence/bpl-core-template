import FeatureGate from '../components/FeatureGate';
import type { FeatureId } from '../config/features';
import { getFeature } from '../config/features';

interface Props {
  featureId: FeatureId;
  subLabel?: string;
}

export default function ModulePage({ featureId, subLabel }: Props) {
  const feature = getFeature(featureId);
  const title = subLabel && subLabel !== feature?.label
    ? `${feature?.label} — ${subLabel}`
    : feature?.label;

  return (
    <FeatureGate featureId={featureId}>
      <div>
        <div style={{ marginBottom: 24 }}>
          <h2 className="bpl-page-title" style={{ fontSize: 22 }}>{title}</h2>
          <p style={{ color: 'var(--cd-text-muted)', marginTop: 4, fontSize: 14 }}>
            Full module — port from client dashboard when wiring MiX API.
          </p>
        </div>
        <div className="bpl-card">
          <div className="bpl-module-placeholder">
            <p style={{ fontSize: 15, marginBottom: 8 }}>{feature?.teaser.summary}</p>
            <p style={{ fontSize: 13 }}>Connect poller + copy pages from bpl-lafarge-dashboard.</p>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
