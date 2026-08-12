import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { tours as defaultTours, type Tour } from '../data/tours';

const STORAGE_KEY = 'nexttour:tours:kzt:v2';
const LEGACY_STORAGE_KEY = 'nexttour:tours:v1';
const EXPANDED_CATALOG_KEY = 'nexttour:expanded-catalog:v1';

type ToursContextValue = {
  tours: Tour[];
  addTour: (tour: Tour) => void;
  updateTour: (tour: Tour) => void;
  deleteTour: (id: string) => void;
  resetTours: () => void;
};

const ToursContext = createContext<ToursContextValue | null>(null);

function loadTours() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const savedTours = JSON.parse(saved) as Tour[];
      if (!localStorage.getItem(EXPANDED_CATALOG_KEY)) {
        const savedIds = new Set(savedTours.map(tour => tour.id));
        localStorage.setItem(EXPANDED_CATALOG_KEY, 'done');
        return [...savedTours, ...defaultTours.filter(tour => !savedIds.has(tour.id))];
      }
      return savedTours;
    }
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) return (JSON.parse(legacy) as Tour[]).map(tour => ({
      ...tour,
      departureCity: tour.departureCity === 'Москва' ? 'Алматы' : tour.departureCity,
      price: tour.price < 500_000 ? tour.price * 10 : tour.price,
      oldPrice: tour.oldPrice && tour.oldPrice < 500_000 ? tour.oldPrice * 10 : tour.oldPrice,
    }));
    localStorage.setItem(EXPANDED_CATALOG_KEY, 'done');
    return defaultTours;
  } catch {
    return defaultTours;
  }
}

export function ToursProvider({ children }: { children: ReactNode }) {
  const [tours, setTours] = useState<Tour[]>(loadTours);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(tours)); }, [tours]);
  const value = useMemo<ToursContextValue>(() => ({
    tours,
    addTour: tour => setTours(current => [tour, ...current]),
    updateTour: tour => setTours(current => current.map(item => item.id === tour.id ? tour : item)),
    deleteTour: id => setTours(current => current.filter(item => item.id !== id)),
    resetTours: () => setTours(defaultTours),
  }), [tours]);
  return <ToursContext.Provider value={value}>{children}</ToursContext.Provider>;
}

export function useTours() {
  const context = useContext(ToursContext);
  if (!context) throw new Error('useTours должен использоваться внутри ToursProvider');
  return context;
}
