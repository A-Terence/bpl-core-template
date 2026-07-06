import type { TenantConfig } from './tenant';
import { SETTINGS_NAV, type NavGroupDef } from './nav';

const ADVANCED_SETTINGS_PATHS = new Set([
  '/settings/thresholds',
  '/settings/api',
  '/settings/roles',
]);

/** Thresholds, API, and Roles tabs — hidden when `ui.showAdvancedSettings` is false. */
export function isAdvancedSettingsPath(pathname: string): boolean {
  return ADVANCED_SETTINGS_PATHS.has(pathname);
}

export function showAdvancedSettings(tenant: TenantConfig): boolean {
  return tenant.ui.showAdvancedSettings !== false;
}

/** Settings sidebar entry — General only, or full dropdown when advanced tabs are enabled. */
export function resolveSettingsNav(tenant: TenantConfig): NavGroupDef {
  if (!showAdvancedSettings(tenant)) {
    return {
      ...SETTINGS_NAV,
      path: '/settings/general',
      children: undefined,
    };
  }
  return SETTINGS_NAV;
}
