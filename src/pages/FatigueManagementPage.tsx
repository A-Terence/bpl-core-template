import { useMemo, useState } from 'react';
import { Moon, Search, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import FeatureGate from '../components/FeatureGate';
import { useFleet, type HosRecord, type HosStatus } from '../context/FleetContext';

const STATUS_META: Record<HosStatus, { label: string; bg: string; color: string }> = {
  compliant: { label: 'Compliant', bg: 'rgba(22,163,74,0.12)', color: '#16a34a' },
  warning: { label: 'At risk', bg: 'rgba(217,119,6,0.12)', color: '#d97706' },
  violation: { label: 'Violation', bg: 'rgba(204,0,0,0.12)', color: '#CC0000' },
};

function fmtDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function drivePct(record: HosRecord) {
  return Math.min(100, Math.round((record.driveMinutesToday / record.driveLimitMinutes) * 100));
}

function KPICard({ label, value, sub, color, icon: Icon }: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="bpl-kpi-card" style={color ? { borderTop: `3px solid ${color}` } : {}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div className="bpl-kpi-label">{label}</div>
        {Icon && <Icon size={15} style={{ color: color || 'var(--cd-text-muted)', opacity: 0.6 }} />}
      </div>
      <div className="bpl-kpi-value" style={color ? { color } : {}}>{value}</div>
      {sub && <div className="bpl-kpi-sub">{sub}</div>}
    </div>
  );
}

function FatigueContent() {
  const { hosRecords, dataSource } = useFleet();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<HosStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return hosRecords.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.driverName.toLowerCase().includes(q)
        || r.vehicleReg.toLowerCase().includes(q)
        || r.site.toLowerCase().includes(q)
      );
    });
  }, [hosRecords, search, statusFilter]);

  const counts = useMemo(() => ({
    compliant: hosRecords.filter(r => r.status === 'compliant').length,
    warning: hosRecords.filter(r => r.status === 'warning').length,
    violation: hosRecords.filter(r => r.status === 'violation').length,
  }), [hosRecords]);

  return (
    <div>
      <div className="bpl-page-header">
        <h1 className="bpl-page-title">Fatigue Management</h1>
        <p className="bpl-page-subtitle">
          Hours-of-service visibility — drive time, duty windows, and rest requirements
          {dataSource === 'demo' && ' (demo data until HOS API is connected)'}
        </p>
      </div>

      <div className="bpl-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <KPICard label="On duty" value={hosRecords.length} icon={Moon} color="#0078D4" sub="Drivers tracked today" />
        <KPICard label="Compliant" value={counts.compliant} icon={CheckCircle} color="#16a34a" sub="Within HOS limits" />
        <KPICard label="At risk" value={counts.warning} icon={Clock} color="#d97706" sub="Approaching drive/duty limits" />
        <KPICard label="Violations" value={counts.violation} icon={AlertTriangle} color="#CC0000" sub="Rest required now" />
      </div>

      <div className="bpl-card bpl-fatigue-toolbar">
        <div className="bpl-fatigue-search">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search driver, vehicle, site…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search HOS records"
          />
        </div>
        <div className="bpl-fatigue-filters">
          {(['all', 'compliant', 'warning', 'violation'] as const).map(s => (
            <button
              key={s}
              type="button"
              className={`bpl-fatigue-filter-btn${statusFilter === s ? ' active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="bpl-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="bpl-dispatch-table bpl-fatigue-table">
          <thead>
            <tr>
              {['Driver', 'Vehicle', 'Site', 'Drive today', 'On duty', 'Drive used', 'Rest due', 'Status'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 28, color: 'var(--cd-text-muted)' }}>
                  No drivers match your filters.
                </td>
              </tr>
            ) : filtered.map(record => {
              const st = STATUS_META[record.status];
              const pct = drivePct(record);
              return (
                <tr key={record.id}>
                  <td><strong>{record.driverName}</strong></td>
                  <td>{record.vehicleReg}</td>
                  <td>{record.site}</td>
                  <td>{fmtDuration(record.driveMinutesToday)}</td>
                  <td>{fmtDuration(record.dutyMinutesToday)}</td>
                  <td>
                    <div className="bpl-fatigue-meter">
                      <div className="bpl-fatigue-meter-track">
                        <div
                          className="bpl-fatigue-meter-fill"
                          style={{
                            width: `${pct}%`,
                            background: record.status === 'violation' ? '#CC0000' : record.status === 'warning' ? '#d97706' : '#16a34a',
                          }}
                        />
                      </div>
                      <span>{pct}%</span>
                    </div>
                  </td>
                  <td>{record.status === 'violation' ? 'Overdue' : fmtTime(record.restDueAt)}</td>
                  <td>
                    <span className="bpl-dispatch-status" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function FatigueManagementPage() {
  return (
    <FeatureGate featureId="drivers">
      <FatigueContent />
    </FeatureGate>
  );
}
