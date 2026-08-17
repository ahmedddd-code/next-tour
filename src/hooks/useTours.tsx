import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { tours as defaultTours, type Tour } from '../data/tours';
import { withUniqueTourCovers } from '../utils/tourImages';
import { useAutoRefresh } from './useAutoRefresh';

type ToursContextValue = { tours: Tour[]; allTours: Tour[]; adminTours: Tour[]; addTour: (tour: Tour) => Promise<void>; updateTour: (tour: Tour) => Promise<void>; deleteTour: (id: string) => Promise<void>; setTourHidden: (id: string, hidden: boolean) => Promise<void>; resyncTourPhotos: (id: string) => Promise<void>; loadAdminTours: () => Promise<void>; resetTours: () => Promise<void> };
const ToursContext = createContext<ToursContextValue | null>(null);
const refreshInterval = () => 5 * 60 * 1000;
const CACHE_KEY = 'nexttour:partner-catalog:v1';
const PAGE_SIZE = 100;

function cachedTours() {
  try {
    const value = localStorage.getItem(CACHE_KEY);
    const parsed = value ? JSON.parse(value) as unknown : null;
    return withUniqueTourCovers(Array.isArray(parsed) && parsed.length ? parsed as Tour[] : defaultTours);
  } catch { return withUniqueTourCovers(defaultTours); }
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
    try {
      const cloudTours: Tour[] = [];
      for (let offset = 0; ; offset += PAGE_SIZE) {
        const data = await invokeToursData({ action: 'list_tours', offset, limit: PAGE_SIZE });
        const page = data.tours as Tour[];
        cloudTours.push(...page);
        if (cloudTours.length) {
          const visibleTours = withUniqueTourCovers(cloudTours);
          setTours(visibleTours);
          cacheTours(visibleTours);
        }
        if (data.hasMore !== true) break;
      }
    }
    catch { /* Встроенный каталог остаётся доступен при временном отсутствии сети. */ }
  }, []);
  const loadAdminTours = useCallback(async () => {
    const data = await invokeToursData({ action: 'admin_list_tours' }, true);
    setAdminTours(data.tours as Tour[]);
  }, []);
  useAutoRefresh(load, refreshInterval);
  const reloadAll = async () => { await Promise.all([load(), loadAdminTours()]); };
  const save = async (tour: Tour) => { await invokeToursData({ action: 'admin_upsert_tour', tour }, true); await reloadAll(); };
  const setTourHidden = async (id: string, hidden: boolean) => {
    const updateVisibility = (items: Tour[]) => items.map(tour => tour.id === id ? { ...tour, isHidden: hidden } : tour);

    // Отражаем нажатие сразу, не дожидаясь запроса и повторной загрузки каталога.
    setAdminTours(updateVisibility);
    setTours(current => {
      const updated = hidden ? current.filter(tour => tour.id !== id) : updateVisibility(current);
      cacheTours(updated);
      return updated;
    });

    try {
      await invokeToursData({ action: 'admin_set_tour_hidden', id, hidden }, true);
    } catch (error) {
      // Сервер не принял изменение — возвращаем фактическое состояние из облака.
      await reloadAll();
      throw error;
    }

    await reloadAll();
  };
  const value = useMemo<ToursContextValue>(() => ({
    tours, allTours: tours, adminTours, addTour: save, updateTour: save, loadAdminTours,
    setTourHidden,
    resyncTourPhotos: async id => { await invokeToursData({ action: 'admin_resync_tour_photos', id }, true); await reloadAll(); },
    deleteTour: async id => { await invokeToursData({ action: 'admin_delete_tour', id }, true); await reloadAll(); },
    resetTours: async () => { await invokeToursData({ action: 'admin_reset_tours', tours: defaultTours }, true); await reloadAll(); },
  }), [tours, adminTours, load, loadAdminTours]);
  return <ToursContext.Provider value={value}>{children}</ToursContext.Provider>;
}

export function useTours() { const context = useContext(ToursContext); if (!context) throw new Error('useTours должен использоваться внутри ToursProvider'); return context; }
