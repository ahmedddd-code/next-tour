import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { tours as defaultTours, type Tour } from '../data/tours';
import { useAutoRefresh } from './useAutoRefresh';

type ToursContextValue = { tours: Tour[]; allTours: Tour[]; adminTours: Tour[]; addTour: (tour: Tour) => Promise<void>; updateTour: (tour: Tour) => Promise<void>; deleteTour: (id: string) => Promise<void>; setTourHidden: (id: string, hidden: boolean) => Promise<void>; loadAdminTours: () => Promise<void>; resetTours: () => Promise<void> };
const ToursContext = createContext<ToursContextValue | null>(null);
const refreshInterval = () => 5 * 60 * 1000;
const CACHE_KEY = 'nexttour:partner-catalog:v1';

function cachedTours() {
  try {
    const value = localStorage.getItem(CACHE_KEY);
    const parsed = value ? JSON.parse(value) as unknown : null;
    return Array.isArray(parsed) && parsed.length ? parsed as Tour[] : defaultTours;
  } catch { return defaultTours; }
}

function cacheTours(tours: Tour[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(tours)); } catch { /* Каталог всё равно загружается из облака. */ }
}

async function invokeToursData(body: Record<string, unknown>, admin = false) {
  const { invokeSiteData } = await import('../lib/siteData');
  const { getAdminToken } = await import('../lib/adminSession');
  return invokeSiteData(admin ? { ...body, adminToken: getAdminToken() } : body);
}

export function ToursProvider({ children }: { children: ReactNode }) {
  const [tours, setTours] = useState<Tour[]>(cachedTours);
  const [adminTours, setAdminTours] = useState<Tour[]>([]);
  const load = useCallback(async () => {
    try { const data = await invokeToursData({ action: 'list_tours' }); const cloudTours = data.tours as Tour[]; if (cloudTours.length) { setTours(cloudTours); cacheTours(cloudTours); } }
    catch { /* Встроенный каталог остаётся доступен при временном отсутствии сети. */ }
  }, []);
  const loadAdminTours = useCallback(async () => {
    const data = await invokeToursData({ action: 'admin_list_tours' }, true);
    setAdminTours(data.tours as Tour[]);
  }, []);
  useAutoRefresh(load, refreshInterval);
  const reloadAll = async () => { await Promise.all([load(), loadAdminTours()]); };
  const save = async (tour: Tour) => { await invokeToursData({ action: 'admin_upsert_tour', tour }, true); await reloadAll(); };
  const value = useMemo<ToursContextValue>(() => ({
    tours, allTours: tours, adminTours, addTour: save, updateTour: save, loadAdminTours,
    setTourHidden: async (id, hidden) => { await invokeToursData({ action: 'admin_set_tour_hidden', id, hidden }, true); await reloadAll(); },
    deleteTour: async id => { await invokeToursData({ action: 'admin_delete_tour', id }, true); await reloadAll(); },
    resetTours: async () => { await invokeToursData({ action: 'admin_reset_tours', tours: defaultTours }, true); await reloadAll(); },
  }), [tours, adminTours, load, loadAdminTours]);
  return <ToursContext.Provider value={value}>{children}</ToursContext.Provider>;
}

export function useTours() { const context = useContext(ToursContext); if (!context) throw new Error('useTours должен использоваться внутри ToursProvider'); return context; }
