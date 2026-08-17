import { useCallback, useEffect, useState } from 'react';

type Favorite = { id: string; savedPrice: number };
const FAVORITES_KEY = 'nexttour:favorites:v1';
const RECENT_KEY = 'nexttour:recent:v1';
const CHANGE_EVENT = 'nexttour:memory-change';

function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? '') as T; } catch { return fallback; }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(() => read(FAVORITES_KEY, []));
  useEffect(() => {
    const refresh = () => setFavorites(read(FAVORITES_KEY, []));
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener(CHANGE_EVENT, refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const toggleFavorite = useCallback((id: string, price: number) => {
    const current = read<Favorite[]>(FAVORITES_KEY, []);
    write(FAVORITES_KEY, current.some(item => item.id === id) ? current.filter(item => item.id !== id) : [...current, { id, savedPrice: price }]);
  }, []);
  return { favorites, toggleFavorite, isFavorite: (id: string) => favorites.some(item => item.id === id) };
}

export function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<string[]>(() => read(RECENT_KEY, []));
  useEffect(() => {
    const refresh = () => setRecentIds(read(RECENT_KEY, []));
    window.addEventListener(CHANGE_EVENT, refresh);
    return () => window.removeEventListener(CHANGE_EVENT, refresh);
  }, []);
  const rememberTour = useCallback((id: string) => {
    const current = read<string[]>(RECENT_KEY, []);
    write(RECENT_KEY, [id, ...current.filter(item => item !== id)].slice(0, 6));
  }, []);
  return { recentIds, rememberTour };
}
