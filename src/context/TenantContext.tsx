import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { loadTenantConfig, isFeatureEnabled, type TenantConfig } from '../config/tenant';
import type { FeatureId } from '../config/features';
import { FEATURE_REGISTRY, getNavFeatures, DASHBOARD_FEATURE } from '../config/features';

interface TenantContextValue {
  tenant: TenantConfig;
  isEnabled: (id: FeatureId) => boolean;
  navFeatures: ReturnType<typeof getNavFeatures>;
  unavailableFeatures: typeof FEATURE_REGISTRY;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => {
    const tenant = loadTenantConfig();
    const navFeatures = getNavFeatures();
    const unavailableFeatures = navFeatures.filter(f => !isFeatureEnabled(tenant, f.id));

    return {
      tenant,
      isEnabled: (id: FeatureId) => isFeatureEnabled(tenant, id),
      navFeatures,
      unavailableFeatures: tenant.ui.showUnavailableFeatures ? unavailableFeatures : [],
    };
  }, []);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}

export { DASHBOARD_FEATURE };
