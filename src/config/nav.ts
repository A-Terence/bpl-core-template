import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Users, User, GraduationCap, Award, BadgeCheck,
  AlertTriangle, Search, ListChecks,
  Shield, Wrench, FileBarChart2, Folder, Truck, Percent, Clock, DollarSign, Fuel, Navigation, Route, Map, Brain, BarChart3,
  Settings, Cog, SlidersHorizontal, Plug, ShieldCheck,
} from 'lucide-react';
import type { FeatureId } from './features';

export interface NavSubItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroupDef {
  /** null = always shown (Dashboard) */
  featureId: FeatureId | null;
  path: string;
  label: string;
  icon: LucideIcon;
  children?: NavSubItem[];
}

/** Default sidebar structure — driven by tenant.config.json features */
export const SIDEBAR_NAV: NavGroupDef[] = [
  { featureId: null, path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { featureId: 'fleet', path: '/fleet', label: 'Fleet', icon: Map },
  {
    featureId: 'drivers',
    path: '/drivers',
    label: 'Driver Management',
    icon: Users,
    children: [
      { path: '/drivers', label: 'Drivers', icon: User },
      { path: '/drivers/coaching', label: 'Coaching', icon: GraduationCap },
      { path: '/drivers/training', label: 'Training', icon: Award },
      { path: '/drivers/certifications', label: 'Certifications', icon: BadgeCheck },
    ],
  },
  {
    featureId: 'incidents',
    path: '/incidents',
    label: 'Incident Intelligence',
    icon: AlertTriangle,
    children: [
      { path: '/incidents', label: 'Event Explorer', icon: Search },
      { path: '/incidents/response', label: 'Response Tracking', icon: ListChecks },
    ],
  },
  { featureId: 'safety', path: '/safety', label: 'Safety', icon: Shield },
  {
    featureId: 'fuel',
    path: '/fuel',
    label: 'Fuel',
    icon: Fuel,
    children: [
      { path: '/fuel/monitoring', label: 'Monitoring', icon: Fuel },
      { path: '/fuel/consumption', label: 'Consumption', icon: BarChart3 },
    ],
  },
  { featureId: 'dispatch', path: '/dispatch', label: 'Dispatch', icon: Navigation },
  { featureId: 'dispatch', path: '/trips', label: 'Trips', icon: Route },
  { featureId: 'aria', path: '/aria', label: 'AI Insights', icon: Brain },
  {
    featureId: 'reports',
    path: '/reports',
    label: 'Reports',
    icon: FileBarChart2,
    children: [
      { path: '/reports', label: 'Reports', icon: FileBarChart2 },
      { path: '/reports/documents', label: 'Documents', icon: Folder },
    ],
  },
  {
    featureId: 'operations',
    path: '/operations',
    label: 'Operations',
    icon: Truck,
    children: [
      { path: '/operations/utilization', label: 'Utilization', icon: Percent },
      { path: '/operations/productivity', label: 'Productivity', icon: Clock },
      { path: '/operations/economics', label: 'Asset Economics', icon: DollarSign },
    ],
  },
  { featureId: 'maintenance', path: '/maintenance', label: 'Maintenance', icon: Wrench },
];

export const SETTINGS_NAV: NavGroupDef = {
  featureId: 'settings',
  path: '/settings',
  label: 'Settings',
  icon: Settings,
  children: [
    { path: '/settings/general', label: 'General', icon: Cog },
    { path: '/settings/thresholds', label: 'Alert Thresholds', icon: SlidersHorizontal },
    { path: '/settings/api', label: 'Integrations', icon: Plug },
    { path: '/settings/roles', label: 'Roles & Permissions', icon: ShieldCheck },
  ],
};

export function getParentPath(pathname: string, groups: NavGroupDef[]): string | null {
  for (const g of groups) {
    if (g.children) {
      if (g.children.some(c => c.path === pathname) || pathname.startsWith(`${g.path}/`)) {
        return g.path;
      }
    } else if (g.path === pathname || (g.path !== '/' && pathname.startsWith(`${g.path}/`))) {
      return g.path;
    }
  }
  if (pathname.startsWith('/settings')) return '/settings';
  return null;
}

export function getSubLabel(pathname: string, group: NavGroupDef): string | undefined {
  return group.children?.find(c => c.path === pathname)?.label;
}

/** Top bar title from route + tenant branding (home uses dashboardTitle). */
export function getTopBarTitle(pathname: string, dashboardTitle = 'Dashboard'): string {
  if (pathname === '/') return dashboardTitle;

  for (const g of SIDEBAR_NAV) {
    if (g.children) {
      const child = g.children.find(c => c.path === pathname);
      if (child) return child.label;
      if (pathname.startsWith(`${g.path}/`) || pathname === g.path) return g.label;
    } else if (g.path === pathname || (g.path !== '/' && pathname.startsWith(`${g.path}/`))) {
      return g.label;
    }
  }

  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname === '/fleet') return 'Fleet';
  if (pathname === '/trips') return 'Trips';
  if (pathname === '/aria') return 'AI Insights';

  return dashboardTitle;
}
