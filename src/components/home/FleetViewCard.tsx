import { useMemo, useState, type ElementType } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Map as MapIcon, Table } from 'lucide-react';
import { useFleet, type StatusFilter } from '../../context/FleetContext';
import { useTenant } from '../../context/TenantContext';
import FleetGroupedCompact from './FleetGroupedCompact';
import FleetCompactTable from './FleetCompactTable';

type ViewMode = 'table' | 'map' | 'grouped';

interface Props {
  statusFilter: StatusFilter;
}

export default function FleetViewCard({ statusFilter }: Props) {
  const { vehicles } = useFleet();
  const { isEnabled } = useTenant();
  const [viewMode, setViewMode] = useState<ViewMode>('map');

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return vehicles;
    if (statusFilter === 'Inactive') return vehicles.filter(v => v.status === 'Inactive');
    if (statusFilter === 'Offline') return vehicles.filter(v => v.status === 'Offline');
    return vehicles.filter(v => v.status === statusFilter);
  }, [vehicles, statusFilter]);

  if (!isEnabled('fleet')) return null;

  const modes: { id: ViewMode; label: string; icon: ElementType; show: boolean }[] = [
    { id: 'table', label: 'Table', icon: Table, show: true },
    { id: 'grouped', label: 'Grouped', icon: LayoutGrid, show: isEnabled('groupedView') },
    { id: 'map', label: 'Map', icon: MapIcon, show: true },
  ];

  return (
    <div className="bpl-card bpl-live-fleet-card">
      <div className="bpl-live-fleet-header">
        <div className="bpl-live-fleet-header-left">
          <span className="bpl-live-fleet-title">Fleet</span>
        </div>
        <div className="bpl-live-fleet-header-right">
          <div className="bpl-live-fleet-tabs" role="tablist" aria-label="Fleet view">
            {modes.filter(m => m.show).map(m => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={viewMode === m.id}
                  className={`bpl-live-fleet-tab${viewMode === m.id ? ' active' : ''}`}
                  onClick={() => setViewMode(m.id)}
                >
                  <Icon size={12} />
                  {m.label}
                </button>
              );
            })}
          </div>
          <Link to="/fleet" className="bpl-card-link">View all</Link>
        </div>
      </div>

      <div className="bpl-live-fleet-body">
        {viewMode === 'table' && <FleetCompactTable vehicles={filtered} />}
        {viewMode === 'grouped' && <FleetGroupedCompact vehicles={filtered} />}
        {viewMode === 'map' && (
          <div className="bpl-live-fleet-map">
            <MapIcon size={28} style={{ opacity: 0.25, marginBottom: 8 }} />
            <div>Map preview — {filtered.length} vehicles</div>
          </div>
        )}
      </div>
    </div>
  );
}
