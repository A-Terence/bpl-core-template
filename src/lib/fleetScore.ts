import type { FleetEvent } from '../context/FleetContext';

const REFERENCE_FLEET = 50;

export function computeFleetScore(events: FleetEvent[], vehicleCount: number): { score: number; delta: number } {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

  const score = (evts: FleetEvent[]) => {
    const scale = REFERENCE_FLEET / Math.max(vehicleCount, 1);
    let deduction = 0;
    evts.forEach(e => {
      if (e.label === 'Harsh Braking') deduction += 2;
      else if (e.label === 'Harsh Acceleration') deduction += 1.5;
      else if (e.label === 'Overspeeding' || e.label === 'Overspeed Tiered') deduction += 1.5;
      else if (e.label === 'Harsh Cornering') deduction += 1;
      else if (e.type === 'panic') deduction += 5;
    });
    return Math.max(30, Math.min(100, Math.round(100 - deduction * scale)));
  };

  const eventTime = (e: FleetEvent) => new Date(e.eventTime).getTime();
  const recent = events.filter(e => eventTime(e) >= thirtyDaysAgo);
  const prev = events.filter(e => {
    const t = eventTime(e);
    return t >= sixtyDaysAgo && t < thirtyDaysAgo;
  });

  const current = score(recent);
  const previous = score(prev);
  return { score: current, delta: current - previous };
}
