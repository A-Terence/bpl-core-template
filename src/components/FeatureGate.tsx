import type { ReactNode } from 'react';
import { useTenant } from '../context/TenantContext';
import { getFeature } from '../config/features';
import type { FeatureId } from '../config/features';
import FeatureTeaser from './FeatureTeaser';

interface Props {
  featureId: FeatureId;
  children: ReactNode;
}

export default function FeatureGate({ featureId, children }: Props) {
  const { isEnabled } = useTenant();
  const feature = getFeature(featureId);

  if (!feature) return null;
  if (isEnabled(featureId)) return <>{children}</>;
  return <FeatureTeaser feature={feature} />;
}
