import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Users, AlertTriangle, Shield, Fuel, Navigation,
  Wrench, FileBarChart2, Brain, Cloud, Settings, Map, Truck,
} from 'lucide-react';

export type FeatureId =
  | 'fleet'
  | 'groupedView'
  | 'siteFilter'
  | 'driverDistance'
  | 'panic'
  | 'drivers'
  | 'incidents'
  | 'safety'
  | 'fuel'
  | 'dispatch'
  | 'operations'
  | 'maintenance'
  | 'reports'
  | 'aria'
  | 'environment'
  | 'settings';

export interface FeatureTeaserContent {
  title: string;
  summary: string;
  bullets: string[];
  homeWidget?: string;
}

export interface FeatureDefinition {
  id: FeatureId;
  label: string;
  icon: LucideIcon;
  path: string;
  /** Primary sidebar item (vs sub-feature only) */
  nav: boolean;
  /** Shows a widget on the home summary dashboard */
  homeWidget: boolean;
  teaser: FeatureTeaserContent;
}

export const FEATURE_REGISTRY: FeatureDefinition[] = [
  {
    id: 'fleet',
    label: 'Live Fleet',
    icon: Map,
    path: '/fleet',
    nav: true,
    homeWidget: true,
    teaser: {
      title: 'Live Fleet',
      summary: 'Real-time table, map, and grouped views of every asset with status filters and search.',
      bullets: ['Table, map & grouped views', '10-second live refresh', 'Panic & warning highlights'],
      homeWidget: 'Fleet map overview',
    },
  },
  {
    id: 'drivers',
    label: 'Driver Management',
    icon: Users,
    path: '/drivers',
    nav: true,
    homeWidget: true,
    teaser: {
      title: 'Driver Management',
      summary: 'Profiles, safety scores, coaching history, training, and certifications.',
      bullets: ['Driver risk rankings', 'Coaching workflows', 'Certification tracking'],
      homeWidget: 'Driver performance',
    },
  },
  {
    id: 'incidents',
    label: 'Incident Intelligence',
    icon: AlertTriangle,
    path: '/incidents',
    nav: true,
    homeWidget: true,
    teaser: {
      title: 'Incident Intelligence',
      summary: 'Explore events, analyse patterns by driver, and track response actions.',
      bullets: ['Event explorer', 'Driver & route analysis', 'Response tracking'],
      homeWidget: 'Recent alerts feed',
    },
  },
  {
    id: 'safety',
    label: 'Safety',
    icon: Shield,
    path: '/safety',
    nav: true,
    homeWidget: true,
    teaser: {
      title: 'Safety',
      summary: 'Fleet-wide safety score, configurable thresholds, and coaching recommendations.',
      bullets: ['Fleet safety score gauge', 'Industry reference rules', 'Coaching triggers'],
      homeWidget: 'Safety score KPI',
    },
  },
  {
    id: 'fuel',
    label: 'Fuel',
    icon: Fuel,
    path: '/fuel',
    nav: true,
    homeWidget: true,
    teaser: {
      title: 'Fuel Monitoring',
      summary: 'Live fuel levels, consumption trends, and anomaly detection per asset and site.',
      bullets: ['Fuel level tracking', 'Consumption analytics', 'Theft & drop alerts'],
      homeWidget: 'Fuel consumption chart',
    },
  },
  {
    id: 'dispatch',
    label: 'Dispatch',
    icon: Navigation,
    path: '/dispatch',
    nav: true,
    homeWidget: false,
    teaser: {
      title: 'Dispatch',
      summary: 'Journey management, trip tracking, and on-time delivery monitoring.',
      bullets: ['Ongoing & completed trips', 'ETA progress bars', 'Route deviation alerts'],
    },
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: Truck,
    path: '/operations',
    nav: true,
    homeWidget: false,
    teaser: {
      title: 'Operations',
      summary: 'Utilization, productivity, and asset economics across your fleet.',
      bullets: ['Utilization metrics', 'Productivity scoring', 'Cost per km'],
    },
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: Wrench,
    path: '/maintenance',
    nav: true,
    homeWidget: true,
    teaser: {
      title: 'Maintenance',
      summary: 'Service schedules, overdue alerts, and maintenance compliance tracking.',
      bullets: ['Due-soon dashboard', 'Service history', 'Overdue escalation'],
      homeWidget: 'Maintenance due list',
    },
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileBarChart2,
    path: '/reports',
    nav: true,
    homeWidget: false,
    teaser: {
      title: 'Reports & Reviews',
      summary: 'Weekly, monthly, and quarterly safety reviews with document exports.',
      bullets: ['Scheduled reports', 'Action tracking', 'ISO evidence exports'],
    },
  },
  {
    id: 'aria',
    label: 'AI Insights',
    icon: Brain,
    path: '/aria',
    nav: true,
    homeWidget: true,
    teaser: {
      title: 'ARIA Intelligence',
      summary: 'AI fleet advisor — root cause analysis, coaching, and chat.',
      bullets: ['SafeIQ incident analysis', 'ARIA chat assistant', 'Automated insights'],
      homeWidget: 'AI insights panel',
    },
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: Cloud,
    path: '/environment',
    nav: false,
    homeWidget: true,
    teaser: {
      title: 'Environment & Traffic',
      summary: 'Weather and traffic context at incident time for smarter decisions.',
      bullets: ['Weather at event location', 'Traffic density', 'Road type inference'],
      homeWidget: 'Weather & traffic strip',
    },
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    nav: true,
    homeWidget: false,
    teaser: {
      title: 'Settings',
      summary: 'Platform configuration, API connections, alert thresholds, and roles.',
      bullets: ['Integration connections', 'Alert thresholds', 'Roles & permissions'],
    },
  },
];

/** Sub-features — toggled but not separate nav items */
export const SUB_FEATURES: FeatureId[] = ['groupedView', 'siteFilter', 'driverDistance', 'panic'];

export function getFeature(id: FeatureId): FeatureDefinition | undefined {
  return FEATURE_REGISTRY.find(f => f.id === id);
}

export function getNavFeatures(): FeatureDefinition[] {
  return FEATURE_REGISTRY.filter(f => f.nav && f.id !== 'settings');
}

export const DASHBOARD_FEATURE: FeatureDefinition = {
  id: 'fleet',
  label: 'Dashboard',
  icon: LayoutDashboard,
  path: '/',
  nav: true,
  homeWidget: false,
  teaser: { title: 'Dashboard', summary: '', bullets: [] },
};
