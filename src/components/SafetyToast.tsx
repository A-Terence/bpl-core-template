import { useEffect, useRef } from 'react';
import type { SafetyNotification, Severity } from '../hooks/useSafeIQ';
import { formatEnvironmentLine } from './EnvironmentBadge';

interface Props {
  notifications: SafetyNotification[];
  onDismiss: (id: string) => void;
  onOpen: (n: SafetyNotification) => void;
  onClearAll: () => void;
}

function severityColor(s: Severity) {
  if (s === 'RED') return '#dc2626';
  if (s === 'YELLOW') return '#d97706';
  return '#16a34a';
}

function severityPillClass(s: Severity) {
  if (s === 'RED') return 'bpl-safeiq-pill-red';
  if (s === 'YELLOW') return 'bpl-safeiq-pill-yellow';
  return 'bpl-safeiq-pill-green';
}

function severityLabel(s: Severity) {
  if (s === 'RED') return 'RED ALERT';
  if (s === 'YELLOW') return 'CAUTION';
  return 'IMPROVING';
}

function incidentLabel(type: string) {
  if (type === 'harsh_braking') return 'Harsh Braking';
  if (type === 'harsh_acceleration') return 'Harsh Acceleration';
  if (type === 'speeding') return 'Speeding';
  if (type === 'excessive_idling') return 'Excessive Idling';
  return type;
}

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function autoDismissMs(s: Severity): number | null {
  if (s === 'RED') return null;
  if (s === 'YELLOW') return 30000;
  return 20000;
}

function ToastCard({ n, onDismiss, onOpen }: {
  n: SafetyNotification;
  onDismiss: (id: string) => void;
  onOpen: (n: SafetyNotification) => void;
}) {
  const severity = n.analysis?.severity ?? 'GREEN';
  const duration = autoDismissMs(severity);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accentColor = severityColor(severity);

  useEffect(() => {
    if (duration !== null) {
      timerRef.current = setTimeout(() => onDismiss(n.id), duration);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [duration, n.id, onDismiss]);

  const handleOpen = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onOpen(n);
  };

  return (
    <div className="bpl-safeiq-toast-wrap">
      <div
        className={`bpl-safeiq-toast${severity === 'RED' ? ' bpl-safeiq-toast--red' : ''}`}
        style={{ borderLeftColor: accentColor }}
        onClick={handleOpen}
      >
        <div className="bpl-safeiq-toast-top">
          <span className={severityPillClass(severity)}>{severityLabel(severity)}</span>
          <span className="bpl-safeiq-toast-driver">{n.driver.name}</span>
          <button type="button" className="bpl-safeiq-toast-dismiss" onClick={e => { e.stopPropagation(); onDismiss(n.id); }} aria-label="Dismiss">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="bpl-safeiq-toast-meta">
          {incidentLabel(n.type)} · {n.vehicle.id} · <span style={{ color: accentColor }}>{n.magnitude}</span>
        </div>
        {n.location && <div className="bpl-safeiq-toast-location">{n.location}</div>}
        <div className="bpl-safeiq-toast-env">{formatEnvironmentLine(n.environment)}</div>
        {n.analysis && <div className="bpl-safeiq-toast-reason">{n.analysis.severity_reason}</div>}
        <div className="bpl-safeiq-toast-foot">
          <span>{timeAgo(n.timestamp)}</span>
          <span className="bpl-safeiq-toast-link">View Analysis →</span>
        </div>
      </div>
      {duration && (
        <div className="bpl-safeiq-toast-drain" style={{ background: accentColor, animationDuration: `${duration / 1000}s` }} />
      )}
    </div>
  );
}

export default function SafetyToast({ notifications, onDismiss, onOpen, onClearAll }: Props) {
  if (notifications.length === 0) return null;

  return (
    <div className="bpl-safeiq-toast-stack">
      {notifications.length >= 2 && (
        <div className="bpl-safeiq-toast-clear-wrap">
          <button type="button" className="bpl-safeiq-toast-clear" onClick={onClearAll}>
            Clear all ({notifications.length})
          </button>
        </div>
      )}
      {notifications.map(n => (
        <ToastCard key={n.id} n={n} onDismiss={onDismiss} onOpen={onOpen} />
      ))}
    </div>
  );
}
