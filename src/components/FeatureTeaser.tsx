import { Lock } from 'lucide-react';
import type { FeatureDefinition } from '../config/features';

interface Props {
  feature: FeatureDefinition;
}

export default function FeatureTeaser({ feature }: Props) {
  const { teaser } = feature;
  const Icon = feature.icon;

  return (
    <div className="bpl-teaser">
      <div className="bpl-teaser-icon">
        <Icon size={28} />
      </div>
      <span className="bpl-teaser-badge">
        <Lock size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
        Not included in your plan
      </span>
      <h2 style={{ marginTop: 20 }}>{teaser.title}</h2>
      <p>{teaser.summary}</p>
      <ul>
        {teaser.bullets.map(b => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <p style={{ fontSize: 13, color: 'var(--cd-text-soft)' }}>
        Contact Best Practices Ltd to enable this module for your fleet.
      </p>
    </div>
  );
}
