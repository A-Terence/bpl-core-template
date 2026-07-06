import type { FeatureId } from './features';
import tenantJson from '../../tenant.config.json';

export interface TenantBranding {
  clientName: string;
  platformName: string;
  tagline: string;
  logo: string;
  /** Browser tab icon — defaults to /favicon.svg */
  favicon?: string;
  primaryColor: string;
  /** Top bar heading on the home dashboard */
  dashboardTitle?: string;
  /** Browser tab title — defaults to "{platformName} · {clientName}" */
  documentTitle?: string;
}

export interface TenantUser {
  displayName: string;
}

export interface TenantConfig {
  id: string;
  branding: TenantBranding;
  user?: TenantUser;
  ui: {
    showUnavailableFeatures: boolean;
    /** When false, Settings shows General only (hides Thresholds, API, Roles). Default: true */
    showAdvancedSettings?: boolean;
  };
  features: Record<FeatureId, boolean>;
}

export function loadTenantConfig(): TenantConfig {
  const config = tenantJson as TenantConfig;
  applyBranding(config.branding);
  return config;
}

function applyBranding(branding: TenantBranding) {
  if (branding.primaryColor) {
    document.documentElement.style.setProperty('--tenant-primary', branding.primaryColor);
  }

  document.title = branding.documentTitle ?? `${branding.platformName} · ${branding.clientName}`;

  const faviconHref = branding.favicon ?? '/favicon.svg';
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = faviconHref.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  link.href = faviconHref;
}

export function isFeatureEnabled(config: TenantConfig, id: FeatureId): boolean {
  return config.features[id] === true;
}

export function enabledFeatures(config: TenantConfig): FeatureId[] {
  return (Object.keys(config.features) as FeatureId[]).filter(id => config.features[id]);
}

export function disabledNavFeatures(config: TenantConfig, navIds: FeatureId[]): FeatureId[] {
  return navIds.filter(id => !config.features[id]);
}
