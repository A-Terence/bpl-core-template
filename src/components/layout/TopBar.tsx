import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Bell, Menu, Moon, Power, ShieldAlert, Sun } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useTheme } from '../../context/ThemeContext';
import { getTopBarTitle } from '../../config/nav';
import type { SafetyNotification } from '../../hooks/useSafeIQ';
import EnvironmentBadge from '../EnvironmentBadge';
import LogoutConfirmModal from '../LogoutConfirmModal';

interface Props {
  subtitle?: string;
  onMenuOpen?: () => void;
  notifications: SafetyNotification[];
  notifOpen: boolean;
  onNotifToggle: () => void;
  onNotifClose: () => void;
  onNotifOpen: (n: SafetyNotification) => void;
  onNotifDismiss: (id: string) => void;
  onNotifClearAll: () => void;
  onLogout?: () => void;
}

function severityColor(s: string) {
  if (s === 'RED') return '#dc2626';
  if (s === 'YELLOW') return '#d97706';
  return '#16a34a';
}

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function TopBar({
  subtitle,
  onMenuOpen,
  notifications,
  notifOpen,
  onNotifToggle,
  onNotifClose,
  onNotifOpen,
  onNotifDismiss,
  onNotifClearAll,
  onLogout,
}: Props) {
  const { tenant, isEnabled } = useTenant();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const notifRef = useRef<HTMLDivElement>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const title = getTopBarTitle(location.pathname, tenant.branding.dashboardTitle ?? 'Dashboard');

  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) onNotifClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen, onNotifClose]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
      return;
    }
    window.location.reload();
  };

  return (
    <>
      <header className="bpl-topbar">
        <div className="bpl-topbar-left">
          <button
            type="button"
            className="bpl-icon-btn bpl-topbar-menu-btn"
            onClick={onMenuOpen}
            aria-label="Open menu"
            title="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className="bpl-topbar-titles">
            <h1>{title}</h1>
            <p>{subtitle ?? tenant.branding.tagline}</p>
          </div>
        </div>

        <div className="bpl-topbar-right">
          <div className="bpl-topbar-notif-wrap" ref={notifRef}>
            <button type="button" className="bpl-icon-btn" title="SafeIQ Notifications" onClick={onNotifToggle}>
              <Bell size={16} />
              {notifications.length > 0 && <span className="bpl-notif-badge">{notifications.length}</span>}
            </button>

            {notifOpen && (
              <div className="bpl-safeiq-notif-panel">
                <div className="bpl-safeiq-notif-head">
                  <span>SafeIQ Notifications</span>
                  {notifications.length > 0 && (
                    <>
                      <span className="bpl-safeiq-notif-count">{notifications.length}</span>
                      <button type="button" className="bpl-safeiq-notif-clear" onClick={() => { onNotifClearAll(); onNotifClose(); }}>
                        Clear all
                      </button>
                    </>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="bpl-safeiq-notif-empty">No notifications yet</div>
                ) : (
                  <>
                    <div className="bpl-safeiq-notif-list">
                      {notifications.map((n, i) => {
                        const severity = n.analysis?.severity ?? 'GREEN';
                        const accent = severityColor(severity);
                        return (
                          <div
                            key={n.id}
                            className="bpl-safeiq-notif-item"
                            style={{ borderBottom: i < notifications.length - 1 ? undefined : 'none' }}
                            onClick={() => { onNotifOpen(n); onNotifClose(); }}
                          >
                            <ShieldAlert size={14} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
                            <div className="bpl-safeiq-notif-item-body">
                              <div className="bpl-safeiq-notif-driver">{n.driver.name}</div>
                              <div className="bpl-safeiq-notif-sub">
                                {n.magnitude} · {n.vehicle.id}
                                {n.eventCount > 1 && <span style={{ color: accent, fontWeight: 600 }}> · {n.eventCount} incidents/30d</span>}
                              </div>
                              <EnvironmentBadge environment={n.environment} compact />
                              <div className="bpl-safeiq-notif-time">
                                {timeAgo(n.timestamp)}
                                {n.analysis && <span style={{ color: accent, marginLeft: 6, fontWeight: 600 }}>{severity}</span>}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="bpl-safeiq-notif-dismiss"
                              onClick={e => { e.stopPropagation(); onNotifDismiss(n.id); }}
                            >
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {isEnabled('aria') && (
                      <div className="bpl-safeiq-notif-footer">
                        <Link to="/aria" className="bpl-safeiq-notif-view-all" onClick={onNotifClose}>
                          View all in AI Insights
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="bpl-topbar-actions">
            <button
              type="button"
              className="bpl-icon-btn"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              className="bpl-icon-btn"
              onClick={() => setShowLogoutConfirm(true)}
              aria-label="Log out"
              title="Log out"
            >
              <Power size={16} />
            </button>
          </div>
        </div>
      </header>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
