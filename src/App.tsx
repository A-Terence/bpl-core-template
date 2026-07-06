import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import { ThemeProvider } from './context/ThemeContext';
import { FleetProvider } from './context/FleetContext';
import { SafeIQProvider } from './context/SafeIQContext';
import AppShell from './components/layout/AppShell';
import Home from './pages/Home';
import FleetPage from './pages/FleetPage';
import FuelMonitoringPage from './pages/FuelMonitoringPage';
import FuelConsumptionPage from './pages/FuelConsumptionPage';
import DispatchPage from './pages/DispatchPage';
import TripsPage from './pages/TripsPage';
import ReportsPage from './pages/ReportsPage';
import AiInsightsPage from './pages/AiInsightsPage';
import FatigueManagementPage from './pages/FatigueManagementPage';
import ModulePage from './pages/ModulePage';
import Settings from './pages/Settings';
import { SIDEBAR_NAV } from './config/nav';
import type { FeatureId } from './config/features';

const MODULE_IDS = new Set<FeatureId>([
  'drivers', 'incidents', 'safety', 'maintenance', 'reports', 'operations',
]);

const DEDICATED_MODULE_PATHS = new Set(['/drivers/fatigue']);

function moduleRoutes() {
  const routes: { path: string; featureId: FeatureId; subLabel?: string }[] = [];
  for (const group of SIDEBAR_NAV) {
    if (!group.featureId || !MODULE_IDS.has(group.featureId)) continue;
    if (group.featureId === 'reports') {
      for (const child of group.children ?? []) {
        if (child.path === '/reports') continue;
        routes.push({ path: child.path, featureId: group.featureId, subLabel: child.label });
      }
      continue;
    }
    if (group.children) {
      routes.push({ path: group.path, featureId: group.featureId });
      for (const child of group.children) {
        if (child.path === group.path) continue;
        if (DEDICATED_MODULE_PATHS.has(child.path)) continue;
        routes.push({ path: child.path, featureId: group.featureId, subLabel: child.label });
      }
    } else {
      routes.push({ path: group.path, featureId: group.featureId });
    }
  }
  return routes;
}

export default function App() {
  return (
    <TenantProvider>
      <ThemeProvider>
        <FleetProvider>
          <SafeIQProvider>
          <HashRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<Home />} />
                <Route path="/fleet" element={<FleetPage />} />
                <Route path="/fuel" element={<Navigate to="/fuel/monitoring" replace />} />
                <Route path="/fuel/monitoring" element={<FuelMonitoringPage />} />
                <Route path="/fuel/consumption" element={<FuelConsumptionPage />} />
                <Route path="/dispatch" element={<DispatchPage />} />
                <Route path="/trips" element={<TripsPage />} />
                <Route path="/incidents/analysis" element={<Navigate to="/incidents" replace />} />
                <Route path="/reports/weekly" element={<Navigate to="/reports" replace />} />
                <Route path="/reports/monthly" element={<Navigate to="/reports" replace />} />
                <Route path="/reports/quarterly" element={<Navigate to="/reports" replace />} />
                <Route path="/reports/actions" element={<Navigate to="/reports" replace />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/aria" element={<AiInsightsPage />} />
                <Route path="/drivers/fatigue" element={<FatigueManagementPage />} />
                {moduleRoutes().map(r => (
                  <Route
                    key={r.path}
                    path={r.path}
                    element={<ModulePage featureId={r.featureId} subLabel={r.subLabel} />}
                  />
                ))}
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/general" element={<Settings />} />
                <Route path="/settings/thresholds" element={<Settings />} />
                <Route path="/settings/api" element={<Settings />} />
                <Route path="/settings/roles" element={<Settings />} />
              </Route>
            </Routes>
          </HashRouter>
          </SafeIQProvider>
        </FleetProvider>
      </ThemeProvider>
    </TenantProvider>
  );
}
