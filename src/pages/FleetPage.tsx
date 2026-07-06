import FeatureGate from '../components/FeatureGate';

export default function FleetPage() {
  return (
    <FeatureGate featureId="fleet">
      <div>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--cd-font-display)' }}>Live Fleet</h2>
          <p style={{ color: 'var(--cd-text-muted)', marginTop: 4 }}>
            Table, map, and grouped views — port AnomaliesTable, MapView, GroupedView from existing dashboards.
          </p>
        </div>
        <div className="bpl-card">
          <div className="bpl-module-placeholder">
            Fleet monitor module placeholder. Wire live table, map, and grouped views from your client deploy.
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
