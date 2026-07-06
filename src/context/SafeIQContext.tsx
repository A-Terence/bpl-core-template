import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { SafetyNotification } from '../hooks/useSafeIQ';
import { useFleet } from './FleetContext';
import {
  analyzeSafetyEvent,
  buildSafetyNotification,
  getDriverStats,
  isRecentEvent,
  isRelevantSafeIQEvent,
  selectEventsForAnalysis,
  type DriverAnalysisState,
} from '../services/safeiqPipeline';

interface SafeIQContextValue {
  notifications: SafetyNotification[];
  dismiss: (id: string) => void;
  clearAll: () => void;
  selectedNotification: SafetyNotification | null;
  openDetail: (n: SafetyNotification) => void;
  closeDetail: () => void;
}

const SafeIQContext = createContext<SafeIQContextValue | null>(null);

export function SafeIQProvider({ children }: { children: ReactNode }) {
  const { events, vehicles } = useFleet();
  const [notifications, setNotifications] = useState<SafetyNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<SafetyNotification | null>(null);

  const seenEventIds = useRef<Set<string>>(new Set());
  const driverAnalysisRef = useRef<Map<string, DriverAnalysisState>>(new Map());
  const vehiclesRef = useRef(vehicles);

  useEffect(() => {
    vehiclesRef.current = vehicles;
  }, [vehicles]);

  useEffect(() => {
    const newOnes = events.filter(e => {
      if (!e.eventId || seenEventIds.current.has(e.eventId)) return false;
      if (!isRelevantSafeIQEvent(e)) return false;
      return isRecentEvent(e);
    });

    if (newOnes.length === 0) return;

    newOnes.forEach(e => seenEventIds.current.add(e.eventId));

    const { toAnalyse, countUpdates } = selectEventsForAnalysis(
      newOnes,
      events,
      driverAnalysisRef.current,
    );

    if (countUpdates.length > 0) {
      setNotifications(prev =>
        prev.map(n => {
          const update = countUpdates.find(u => u.notifId === n.id);
          if (!update) return n;
          return {
            ...n,
            eventCount: update.eventCount,
            driver: { ...n.driver, incidents_last_30_days: update.eventCount },
          };
        }),
      );
    }

    if (toAnalyse.length === 0) return;

    const newNotifs = toAnalyse.map(e => {
      const stats = getDriverStats(events, e.driverName);
      const vehicle = vehiclesRef.current.find(
        v => v.id === e.assetId || v.regNo === e.regNo,
      );
      return buildSafetyNotification(e, stats, vehicle);
    });

    setNotifications(prev => [...newNotifs, ...prev].slice(0, 10));

    toAnalyse.forEach(async event => {
      const stats = getDriverStats(events, event.driverName);
      const vehicle = vehiclesRef.current.find(
        v => v.id === event.assetId || v.regNo === event.regNo,
      );

      const { environment, analysis } = await analyzeSafetyEvent(event, stats, vehicle);

      setNotifications(prev =>
        prev.map(n =>
          n.id === event.eventId
            ? { ...n, environment, analysis, analysisLoading: false }
            : n,
        ),
      );
    });
  }, [events]);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedNotification(prev => (prev?.id === id ? null : prev));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setSelectedNotification(null);
  }, []);

  const openDetail = useCallback((n: SafetyNotification) => {
    setSelectedNotification(n);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedNotification(null);
  }, []);

  return (
    <SafeIQContext.Provider
      value={{ notifications, dismiss, clearAll, selectedNotification, openDetail, closeDetail }}
    >
      {children}
    </SafeIQContext.Provider>
  );
}

export function useSafeIQ() {
  const ctx = useContext(SafeIQContext);
  if (!ctx) throw new Error('useSafeIQ must be used within SafeIQProvider');
  return ctx;
}
