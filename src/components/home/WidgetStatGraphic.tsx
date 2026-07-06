import type { LucideIcon } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

interface Props {
  color: string;
  icon?: LucideIcon;
  graphicSrc?: string;
  graphicAlt?: string;
  size?: 'sm' | 'md';
}

export default function WidgetStatGraphic({
  color,
  icon: Icon,
  graphicSrc,
  graphicAlt = '',
  size = 'md',
}: Props) {
  const dim = size === 'sm' ? 28 : 36;
  const style: CSSProperties = {
    width: dim,
    height: dim,
    background: `color-mix(in srgb, ${color} 14%, var(--cd-surface))`,
    border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
  };

  return (
    <div className="bpl-stat-graphic" style={style} aria-hidden>
      {graphicSrc ? (
        <img src={graphicSrc} alt={graphicAlt} className="bpl-stat-graphic-img" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 16 : 20} style={{ color }} strokeWidth={2.25} />
      ) : null}
    </div>
  );
}

export function WidgetHeaderGraphic({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return (
    <span
      className="bpl-widget-header-graphic"
      style={{
        background: `color-mix(in srgb, ${color} 12%, var(--cd-surface))`,
        border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
        color,
      }}
    >
      {children}
    </span>
  );
}
