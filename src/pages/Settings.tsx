import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Check, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import FeatureGate from '../components/FeatureGate';
import { useTheme } from '../context/ThemeContext';
import { useTenant } from '../context/TenantContext';
import { isAdvancedSettingsPath, showAdvancedSettings } from '../config/settingsNav';

type Tab = 'general' | 'thresholds' | 'api' | 'roles';

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--cd-border)',
  borderRadius: 8,
  fontSize: 13,
  background: 'var(--cd-surface-2)',
  color: 'var(--cd-text)',
  outline: 'none',
  fontFamily: 'var(--cd-font-body)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--cd-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 4,
  display: 'block',
};

function tabFromPath(pathname: string): Tab {
  if (pathname.includes('/thresholds')) return 'thresholds';
  if (pathname.includes('/api')) return 'api';
  if (pathname.includes('/roles')) return 'roles';
  return 'general';
}

function GeneralSettings() {
  const { theme, setTheme } = useTheme();
  const { tenant } = useTenant();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    clientName: tenant.branding.clientName,
    platform: tenant.branding.platformName,
    timezone: 'Africa/Lagos',
    currency: 'NGN',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="bpl-card" style={{ padding: 20 }}>
        <div className="bpl-settings-section-title">Platform Configuration</div>
        <div className="bpl-settings-grid">
          <div>
            <label style={labelStyle}>Client Name</label>
            <input style={fieldStyle} value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Platform Name</label>
            <input style={fieldStyle} value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Timezone</label>
            <select style={fieldStyle} value={form.timezone} onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))}>
              <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Currency</label>
            <select style={fieldStyle} value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
              <option value="NGN">NGN — Nigerian Naira</option>
              <option value="USD">USD — US Dollar</option>
            </select>
          </div>
        </div>
      </div>
      <div className="bpl-card" style={{ padding: 20 }}>
        <div className="bpl-settings-section-title">Display</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Theme</div>
            <div style={{ fontSize: 12, color: 'var(--cd-text-muted)' }}>Switch between light and dark mode</div>
          </div>
          <div className="bpl-theme-pills">
            {(['light', 'dark'] as const).map(t => (
              <button
                key={t}
                type="button"
                className={`bpl-theme-pill${theme === t ? ' active' : ''}`}
                onClick={() => setTheme(t)}
              >
                {t === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button type="button" className="bpl-btn-primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
        {saved ? <><Check size={14} /> Saved</> : 'Save Settings'}
      </button>
    </div>
  );
}

function ThresholdSettings() {
  const [thresholds, setThresholds] = useState({
    harshBrakingIntervention: 8,
    fleetScoreWarning: 70,
    fleetScoreCritical: 50,
    panicAutoAlert: true,
    staleDataThreshold: 60,
  });
  const [saved, setSaved] = useState(false);

  return (
    <div className="bpl-card" style={{ padding: 20 }}>
      <div className="bpl-settings-section-title">Safety Thresholds</div>
      <p style={{ fontSize: 12, color: 'var(--cd-text-muted)', marginBottom: 16 }}>
        These thresholds control when alerts are triggered and when intervention is required.
      </p>
      <div className="bpl-settings-grid">
        {[
          { label: 'Harsh Braking Intervention', key: 'harshBrakingIntervention', unit: 'events/30 days' },
          { label: 'Fleet Score Warning', key: 'fleetScoreWarning', unit: '/100' },
          { label: 'Fleet Score Critical', key: 'fleetScoreCritical', unit: '/100' },
          { label: 'Stale Data Threshold', key: 'staleDataThreshold', unit: 'seconds' },
        ].map(f => (
          <div key={f.key}>
            <label style={labelStyle}>{f.label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                style={{ ...fieldStyle, width: 80, flexShrink: 0 }}
                value={thresholds[f.key as keyof typeof thresholds] as number}
                onChange={e => setThresholds(p => ({ ...p, [f.key]: Number(e.target.value) }))}
              />
              <span style={{ fontSize: 12, color: 'var(--cd-text-muted)' }}>{f.unit}</span>
            </div>
          </div>
        ))}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 13, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={thresholds.panicAutoAlert}
          onChange={e => setThresholds(p => ({ ...p, panicAutoAlert: e.target.checked }))}
        />
        Auto-surface panic alerts to all active users immediately
      </label>
      <button type="button" className="bpl-btn-primary" style={{ marginTop: 16 }} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
        {saved ? <><Check size={14} /> Saved</> : 'Save Thresholds'}
      </button>
    </div>
  );
}

function APISettings() {
  const apiKeys: Array<{ name: string; key: string; status: 'connected' | 'not_configured'; desc: string }> = [
    { name: 'AI Assistant (ARIA + SafeIQ)', key: 'ANTHROPIC_API_KEY', status: 'not_configured' as const, desc: 'Server-side only — fleet analysis and coaching' },
    { name: 'Telematics API', key: 'VITE_API_SECRET', status: 'not_configured' as const, desc: 'Live vehicle telemetry and event data' },
    { name: 'Routing & Traffic', key: 'TOMTOM_API_KEY', status: 'not_configured' as const, desc: 'Dispatch routing and traffic context' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {apiKeys.map(api => (
        <div key={api.name} className="bpl-card bpl-api-row">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{api.name}</div>
            <div style={{ fontSize: 12, color: 'var(--cd-text-muted)' }}>{api.desc}</div>
            <div style={{ fontSize: 11, color: 'var(--cd-text-muted)', marginTop: 3 }}>
              Env: <code className="bpl-code">{api.key}</code>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {api.status === 'connected' ? (
              <><CheckCircle size={15} color="#16a34a" /><span className="bpl-api-ok">Connected</span></>
            ) : (
              <><XCircle size={15} color="#d97706" /><span className="bpl-api-warn">Not configured</span></>
            )}
          </div>
        </div>
      ))}
      <div className="bpl-settings-note">
        <AlertCircle size={13} />
        API keys are stored as environment variables (.env). Restart after changes.
      </div>
    </div>
  );
}

function RoleSettings() {
  const roles = [
    { role: 'Admin', desc: 'Full platform access, user management, API configuration', permissions: ['All sections', 'Settings', 'Reset'] },
    { role: 'HSE Officer', desc: 'Safety, ARIA, Driver Management, Incidents', permissions: ['Safety', 'ARIA', 'Drivers', 'Incidents'] },
    { role: 'Operations Manager', desc: 'Dashboard, Fleet view, Operations', permissions: ['Dashboard', 'Operations', 'Fleet'] },
    { role: 'View Only', desc: 'Read-only access to Dashboard and Reports', permissions: ['Dashboard', 'Reports'] },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {roles.map(r => (
        <div key={r.role} className="bpl-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{r.role}</div>
          <div style={{ fontSize: 12, color: 'var(--cd-text-muted)', marginBottom: 8 }}>{r.desc}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {r.permissions.map(p => (
              <span key={p} className="bpl-perm-chip">{p}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const TAB_TITLES: Record<Tab, string> = {
  general: 'General',
  thresholds: 'Alert Thresholds',
  api: 'API Connections',
  roles: 'Roles & Permissions',
};

export default function Settings() {
  const location = useLocation();
  const { tenant } = useTenant();
  const advanced = showAdvancedSettings(tenant);
  const tab = tabFromPath(location.pathname);

  if (!advanced && (location.pathname === '/settings' || isAdvancedSettingsPath(location.pathname))) {
    return <Navigate to="/settings/general" replace />;
  }

  return (
    <FeatureGate featureId="settings">
      <div className="bpl-page-header">
        <h1 className="bpl-page-title">Settings — {TAB_TITLES[tab]}</h1>
        <p className="bpl-page-subtitle">
          {advanced
            ? 'Platform configuration, API connections, and user management'
            : 'Platform configuration and display preferences'}
        </p>
      </div>
      {tab === 'general' && <GeneralSettings />}
      {advanced && tab === 'thresholds' && <ThresholdSettings />}
      {advanced && tab === 'api' && <APISettings />}
      {advanced && tab === 'roles' && <RoleSettings />}
    </FeatureGate>
  );
}
