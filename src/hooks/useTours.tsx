import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { tours as defaultTours, type Tour } from '../data/tours';
import { ADMIN_PASSWORD, invokeSiteData } from '../lib/siteData';

type ToursContextValue = { tours: Tour[]; addTour: (tour: Tour) => Promise<void>; updateTour: (tour: Tour) => Promise<void>; deleteTour: (id: string) => Promise<void>; resetTours: () => Promise<void> };
const ToursContext = createContext<ToursContextValue | null>(null);

export function ToursProvider({ children }: { children: ReactNode }) {
  const [tours, setTours] = useState<Tour[]>(defaultTours);
  const load = useCallback(async () => {
    try { const data = await invokeSiteData({ action: 'list_tours' }); const cloudTours = data.tours as Tour[]; if (cloudTours.length) setTours(cloudTours); }
    catch { /* Встроенный каталог остаётся доступен при временном отсутствии сети. */ }
  }, []);
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 5000); return () => window.clearInterval(timer); }, [load]);
  const save = async (tour: Tour) => { await invokeSiteData({ action: 'admin_upsert_tour', adminPassword: ADMIN_PASSWORD, tour }); await load(); };
  const value = useMemo<ToursContextValue>(() => ({
    tours, addTour: save, updateTour: save,
    deleteTour: async id => { await invokeSiteData({ action: 'admin_delete_tour', adminPassword: ADMIN_PASSWORD, id }); await load(); },
    resetTours: async () => { await invokeSiteData({ action: 'admin_reset_tours', adminPassword: ADMIN_PASSWORD, tours: defaultTours }); await load(); },
  }), [tours, load]);
  return <ToursContext.Provider value={value}>{children}</ToursContext.Provider>;
}

export function useTours() { const context = useContext(ToursContext); if (!context) throw new Error('useTours должен использоваться внутри ToursProvider'); return context; }
