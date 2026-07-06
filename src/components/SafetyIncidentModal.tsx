import type { ReactNode } from 'react';
import { ShieldAlert, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SafetyNotification, Severity } from '../hooks/useSafeIQ';
import EnvironmentBadge from './EnvironmentBadge';

const DANGER_PATTERN = /\b(harsh braking|harsh acceleration|overspeeding|overspeed tiered|overspeed|cornering|panic alert|panic|tailgating|following distance|speeding|collision|near.miss|critical|immediate action|intervention required)\b/gi;
const IMPORTANT_PATTERN = /\b(rain|wet|fog|visibility|slippery|heavy traffic|congestion|peak hour|FMCSA|FRSC|ISO 39001|BASIC|threshold|recurring|pattern|behaviour|behavior|trend|escalat)\b/gi;

function HighlightedText({ text }: { text: string }) {
  const combined = new RegExp(
    `(?<danger>${DANGER_PATTERN.source})|(?<important>${IMPORTANT_PATTERN.source})`,
    'gi',
  );
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = combined.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const isDanger = match.groups?.danger !== undefined;
    parts.push(
      <mark key={match.index} className={isDanger ? 'bpl-safeiq-mark-danger' : 'bpl-safeiq-mark-important'}>
        {match[0]}
      </mark>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

interface Props {
  notification: SafetyNotification;
  onClose: () => void;
}

function severityBannerClass(s: Severity) {
  if (s === 'RED') return 'bpl-safeiq-banner-red';
  if (s === 'YELLOW') return 'bpl-safeiq-banner-yellow';
  return 'bpl-safeiq-banner-green';
}

function severityBadgeClass(s: Severity) {
  if (s === 'RED') return 'bpl-safeiq-badge-red';
  if (s === 'YELLOW') return 'bpl-safeiq-badge-yellow';
  return 'bpl-safeiq-badge-green';
}

function severityEmoji(s: Severity) {
  if (s === 'RED') return '🔴';
  if (s === 'YELLOW') return '🟡';
  return '🟢';
}

function severityText(s: Severity) {
  if (s === 'RED') return 'RED ALERT';
  if (s === 'YELLOW') return 'CAUTION';
  return 'IMPROVING';
}

function scoreBarColor(score: number) {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#d97706';
  return '#dc2626';
}

function trendArrow(trend: string) {
  if (trend === 'improving') return '↑';
  if (trend === 'declining') return '↓';
  return '→';
}

function trendColor(trend: string) {
  if (trend === 'improving') return '#16a34a';
  if (trend === 'declining') return '#dc2626';
  return '#d97706';
}

function incidentLabel(type: string) {
  if (type === 'harsh_braking') return 'Harsh Braking';
  if (type === 'harsh_acceleration') return 'Harsh Acceleration';
  if (type === 'speeding') return 'Speeding';
  if (type === 'excessive_idling') return 'Excessive Idling';
  return type;
}

function formatTimestamp(ts: string) {
  try {
    return new Date(ts).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch {
    return ts;
  }
}

export default function SafetyIncidentModal({ notification: n, onClose }: Props) {
  const analysis = n.analysis;
  const severity = analysis?.severity ?? 'GREEN';
  const navigate = useNavigate();

  const goToDriver = () => {
    onClose();
    navigate(`/drivers?q=${encodeURIComponent(n.driver.name)}`);
  };

  return (
    <div className="bpl-safeiq-modal-overlay" onClick={onClose}>
      <div className="bpl-safeiq-modal" onClick={e => e.stopPropagation()}>
        <div className="bpl-safeiq-modal-head">
          <div className="bpl-safeiq-modal-title">
            <ShieldAlert size={20} />
            <span className="bpl-safeiq-modal-brand">SafeIQ</span>
            <span>Safety Analysis</span>
          </div>
          <button type="button" onClick={onClose} className="bpl-safeiq-modal-close">
            <X size={20} />
          </button>
        </div>

        {analysis && (
          <div className={`bpl-safeiq-modal-banner ${severityBannerClass(severity)}`}>
            <span className={`bpl-safeiq-severity-pill ${severityBadgeClass(severity)}`}>
              {severityEmoji(severity)} {severityText(severity)}
            </span>
            <span className="bpl-safeiq-banner-text">
              <HighlightedText text={analysis.severity_reason} />
            </span>
          </div>
        )}

        <div className="bpl-safeiq-modal-body">
          <div>
            <div className="bpl-safeiq-section-label">Incident Details</div>
            <div className="bpl-safeiq-detail-grid">
              <div className="bpl-safeiq-section-card">
                <div className="bpl-safeiq-field-label">TYPE</div>
                <div className="bpl-safeiq-field-value">{incidentLabel(n.type)}</div>
                <div className="bpl-safeiq-magnitude">{n.magnitude}</div>
              </div>
              <div className="bpl-safeiq-section-card">
                <div className="bpl-safeiq-field-label">TIME</div>
                <div className="bpl-safeiq-field-value">{formatTimestamp(n.timestamp)}</div>
              </div>
              {n.location && (
                <div className="bpl-safeiq-section-card">
                  <div className="bpl-safeiq-field-label">LOCATION</div>
                  <div className="bpl-safeiq-field-value">{n.location}</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bpl-safeiq-section-label">Environmental Conditions</div>
            <EnvironmentBadge environment={n.environment} />
          </div>

          <div>
            <div className="bpl-safeiq-section-label">Driver &amp; Vehicle</div>
            <div className="bpl-safeiq-detail-grid">
              <div className="bpl-safeiq-section-card">
                <button type="button" onClick={goToDriver} className="bpl-safeiq-driver-link">
                  <span>{n.driver.name}</span>
                  <ExternalLink size={11} />
                </button>
                <div className="bpl-safeiq-driver-id">{n.driver.id}</div>
                <div className="bpl-safeiq-field-label">SAFETY SCORE</div>
                <div className="bpl-safeiq-score-row">
                  <div className="bpl-safeiq-score-bar">
                    <div style={{ width: `${n.driver.safety_score_baseline}%`, background: scoreBarColor(n.driver.safety_score_baseline) }} />
                  </div>
                  <span style={{ color: scoreBarColor(n.driver.safety_score_baseline) }}>{n.driver.safety_score_baseline}</span>
                </div>
                <div className="bpl-safeiq-meta">Incidents (30 days): {n.driver.incidents_last_30_days}</div>
                <div className="bpl-safeiq-trend">
                  Trend:
                  <span style={{ color: trendColor(n.driver.improvement_trend) }}>
                    {trendArrow(n.driver.improvement_trend)} {n.driver.improvement_trend}
                  </span>
                </div>
              </div>
              <div className="bpl-safeiq-section-card">
                <div className="bpl-safeiq-field-value" style={{ fontSize: 14 }}>{n.vehicle.id}</div>
              </div>
            </div>
          </div>

          {analysis && (
            <div>
              <div className="bpl-safeiq-section-label">SafeIQ Analysis</div>
              <div className="bpl-safeiq-section-card">
                <div className="bpl-safeiq-analysis-block">
                  <div className="bpl-safeiq-field-label">Root Cause</div>
                  <div><HighlightedText text={analysis.root_cause} /></div>
                </div>
                <div className="bpl-safeiq-analysis-block">
                  <div className="bpl-safeiq-field-label">Industry Reference</div>
                  <div className="bpl-safeiq-muted-italic"><HighlightedText text={analysis.industry_reference} /></div>
                </div>
                <div className="bpl-safeiq-analysis-block">
                  <div className="bpl-safeiq-field-label">Coaching Recommendation</div>
                  <div><HighlightedText text={analysis.coaching_recommendation} /></div>
                </div>
              </div>
            </div>
          )}

          {analysis?.ops_flag && (
            <div className="bpl-safeiq-ops-flag">
              <div className="bpl-safeiq-ops-flag-head">⚠️ Operations Flag</div>
              <div><HighlightedText text={analysis.ops_flag_reason} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
