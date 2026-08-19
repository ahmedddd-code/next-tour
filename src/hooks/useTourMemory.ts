import { useCallback, useEffect, useState } from 'react';

type Favorite = { id: string; savedPrice: number };
const FAVORITES_KEY = 'nexttour:favorites:v1';
const RECENT_KEY = 'nexttour:recent:v1';
const COMPARE_KEY = 'nexttour:compare:v1';
const CHANGE_EVENT = 'nexttour:memory-change';
const memoryFallback = new Map<string, unknown>();

function read<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const value = JSON.parse(saved) as T;
      memoryFallback.set(key, value);
      return value;
    }
  } catch { /* На телефонах хранилище может быть отключено. */ }
  return (memoryFallback.get(key) as T | undefined) ?? fallback;
}

function write(key: string, value: unknown) {
  memoryFallback.set(key, value);
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Состояние останется в памяти до закрытия вкладки. */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGE_EVENT));
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

export function useCompare() {
  const [compareIds, setCompareIds] = useState<string[]>(() => read(COMPARE_KEY, []));
  useEffect(() => {
    const refresh = () => setCompareIds(read(COMPARE_KEY, []));
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener(CHANGE_EVENT, refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const toggleCompare = useCallback((id: string) => {
    const current = read<string[]>(COMPARE_KEY, []);
    if (current.includes(id)) write(COMPARE_KEY, current.filter(item => item !== id));
    else if (current.length < 3) write(COMPARE_KEY, [...current, id]);
  }, []);
  const clearCompare = useCallback(() => write(COMPARE_KEY, []), []);
  return { compareIds, toggleCompare, clearCompare, isCompared: (id: string) => compareIds.includes(id), isFull: compareIds.length >= 3 };
}
