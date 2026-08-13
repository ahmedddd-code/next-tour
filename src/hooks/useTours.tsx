import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { tours as defaultTours, type Tour } from '../data/tours';
import { useAutoRefresh } from './useAutoRefresh';

type ToursContextValue = { tours: Tour[]; addTour: (tour: Tour) => Promise<void>; updateTour: (tour: Tour) => Promise<void>; deleteTour: (id: string) => Promise<void>; resetTours: () => Promise<void> };
const ToursContext = createContext<ToursContextValue | null>(null);
const refreshInterval = () => 5 * 60 * 1000;

async function invokeToursData(body: Record<string, unknown>, admin = false) {
  const { ADMIN_PASSWORD, invokeSiteData } = await import('../lib/siteData');
  return invokeSiteData(admin ? { ...body, adminPassword: ADMIN_PASSWORD } : body);
}

export function ToursProvider({ children }: { children: ReactNode }) {
  const [tours, setTours] = useState<Tour[]>(defaultTours);
  const load = useCallback(async () => {
    try { const data = await invokeToursData({ action: 'list_tours' }); const cloudTours = data.tours as Tour[]; if (cloudTours.length) setTours(cloudTours); }
    catch { /* Встроенный каталог остаётся доступен при временном отсутствии сети. */ }
  }, []);
  useAutoRefresh(load, refreshInterval);
  const save = async (tour: Tour) => { await invokeToursData({ action: 'admin_upsert_tour', tour }, true); await load(); };
  const value = useMemo<ToursContextValue>(() => ({
    tours, addTour: save, updateTour: save,
    deleteTour: async id => { await invokeToursData({ action: 'admin_delete_tour', id }, true); await load(); },
    resetTours: async () => { await invokeToursData({ action: 'admin_reset_tours', tours: defaultTours }, true); await load(); },
  }), [tours, load]);
  return <ToursContext.Provider value={value}>{children}</ToursContext.Provider>;
}

export function useTours() { const context = useContext(ToursContext); if (!context) throw new Error('useTours должен использоваться внутри ToursProvider'); return context; }
