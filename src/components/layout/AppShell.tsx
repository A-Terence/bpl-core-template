import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ARIAChat from '../ARIAChat';
import SafetyToast from '../SafetyToast';
import SafetyIncidentModal from '../SafetyIncidentModal';
import { useSafeIQ } from '../../context/SafeIQContext';

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [toastDismissed, setToastDismissed] = useState<Set<string>>(new Set());
  const {
    notifications,
    dismiss,
    clearAll,
    selectedNotification,
    openDetail,
    closeDetail,
  } = useSafeIQ();

  const visibleToasts = notifications.filter(n => !toastDismissed.has(n.id));

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="bpl-app">
      {mobileOpen && (
        <button
          type="button"
          className="bpl-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="bpl-main">
        <TopBar
          onMenuOpen={() => setMobileOpen(true)}
          notifications={notifications}
          notifOpen={notifOpen}
          onNotifToggle={() => setNotifOpen(o => !o)}
          onNotifClose={() => setNotifOpen(false)}
          onNotifOpen={openDetail}
          onNotifDismiss={dismiss}
          onNotifClearAll={clearAll}
        />
        <main className="bpl-page">
          <Outlet />
        </main>
      </div>
      <ARIAChat />
      <SafetyToast
        notifications={visibleToasts}
        onDismiss={id => setToastDismissed(prev => new Set([...prev, id]))}
        onClearAll={() => setToastDismissed(new Set(notifications.map(n => n.id)))}
        onOpen={openDetail}
      />
      {selectedNotification && (
        <SafetyIncidentModal notification={selectedNotification} onClose={closeDetail} />
      )}
    </div>
  );
}
