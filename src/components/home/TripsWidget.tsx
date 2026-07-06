import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFleet } from '../../context/FleetContext';

type TripTab = 'all' | 'ongoing' | 'completed';

const TAB_LABELS: Record<TripTab, string> = {
  all: 'All',
  ongoing: 'Ongoing',
  completed: 'Completed',
};

const STATUS_STYLE = {
  'On Time': { bg: 'rgba(22,163,74,0.12)', color: '#16a34a' },
  Delayed: { bg: 'rgba(217,119,6,0.12)', color: '#d97706' },
  Completed: { bg: 'rgba(100,116,139,0.12)', color: '#64748b' },
};

export default function TripsWidget() {
  const { trips } = useFleet();
  const [tab, setTab] = useState<TripTab>('ongoing');

  const filtered = useMemo(() => {
    if (tab === 'all') return trips;
    if (tab === 'ongoing') return trips.filter(t => t.status !== 'Completed');
    return trips.filter(t => t.status === 'Completed');
  }, [trips, tab]);

  return (
    <div className="bpl-card bpl-home-mid-panel">
      <div className="bpl-card-header bpl-trips-header">
        <span className="bpl-card-title">Trips</span>
        <div className="bpl-trips-header-right">
          <div className="bpl-trips-tabs" role="tablist" aria-label="Trip filter">
          {(Object.keys(TAB_LABELS) as TripTab[]).map(key => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`bpl-trips-tab${tab === key ? ' active' : ''}`}
              onClick={() => setTab(key)}
            >
              {TAB_LABELS[key]}
            </button>
            ))}
          </div>
          <Link to="/trips" className="bpl-card-link">View all</Link>
        </div>
      </div>
      <div className="bpl-card-body bpl-trips-body">
        {filtered.map(trip => {
          const statusStyle = STATUS_STYLE[trip.timing];
          return (
            <Link key={trip.id} to="/dispatch" className="bpl-trip-item bpl-widget-row-link">
              <div className="bpl-trip-top">
                <div>
                  <div className="bpl-trip-vehicle">{trip.vehicle}</div>
                  <div className="bpl-trip-driver">{trip.driver}</div>
                </div>
                <span
                  className="bpl-trip-status"
                  style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                  {trip.timing}
                </span>
              </div>
              <div className="bpl-trip-route">{trip.route}</div>
              <div className="bpl-trip-progress-wrap">
                <div className="bpl-trip-progress-bar" style={{ width: `${trip.progress}%` }} />
              </div>
              <div className="bpl-trip-eta">ETA {trip.eta}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
