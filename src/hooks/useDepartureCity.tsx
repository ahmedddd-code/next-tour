import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { kazakhstanCities } from '../data/kazakhstanCities';

const STORAGE_KEY = 'nexttour:departure-city:v1';
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
type SavedCity = { city: string; expiresAt: number };
type ContextValue = {
  city: string;
  detectedCity: string | null;
  confirmationOpen: boolean;
  selectorOpen: boolean;
  detectedAutomatically: boolean;
  selectCity: (city: string) => void;
  confirmDetectedCity: () => void;
  openSelector: () => void;
  closeSelector: () => void;
};

const DepartureCityContext = createContext<ContextValue | null>(null);

function loadSavedCity() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const saved = JSON.parse(value) as SavedCity;
    if (saved.expiresAt > Date.now() && kazakhstanCities.some(city => city.name === saved.city)) return saved.city;
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* В приватном режиме хранилище может быть недоступно. */ }
  return null;
}

function distanceSquared(latitude: number, longitude: number, city: typeof kazakhstanCities[number]) {
  const longitudeScale = Math.cos(latitude * Math.PI / 180);
  return (latitude - city.latitude) ** 2 + ((longitude - city.longitude) * longitudeScale) ** 2;
}

function timezoneCity() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
  if (zone.includes('almaty')) return 'Алматы';
  if (zone.includes('aqtau') || zone.includes('aktau')) return 'Актау';
  if (zone.includes('aqtobe') || zone.includes('aktobe')) return 'Актобе';
  if (zone.includes('atyrau')) return 'Атырау';
  if (zone.includes('qyzylorda') || zone.includes('kyzylorda')) return 'Кызылорда';
  if (zone.includes('oral')) return 'Уральск';
  return 'Астана';
}

export function DepartureCityProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState<string | null>(loadSavedCity);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [detectedAutomatically, setDetectedAutomatically] = useState(false);

  useEffect(() => {
    if (selectedCity) return;
    let active = true;
    const finish = (city: string, automatic: boolean) => {
      if (!active) return;
      setDetectedCity(city);
      setDetectedAutomatically(automatic);
      setConfirmationOpen(true);
    };
    if (!navigator.geolocation) { finish(timezoneCity(), true); return () => { active = false; }; }
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      const nearest = [...kazakhstanCities].sort((a, b) => distanceSquared(latitude, longitude, a) - distanceSquared(latitude, longitude, b))[0];
      finish(nearest.name, true);
    }, () => finish(timezoneCity(), true), { enableHighAccuracy: false, timeout: 5000, maximumAge: 60 * 60 * 1000 });
    return () => { active = false; };
  }, [selectedCity]);

  const selectCity = (city: string) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ city, expiresAt: Date.now() + THIRTY_DAYS } satisfies SavedCity)); } catch { /* Выбор всё равно сохраняется до закрытия вкладки. */ }
    setSelectedCity(city);
    setDetectedCity(city);
    setConfirmationOpen(false);
    setSelectorOpen(false);
  };

  const value = useMemo<ContextValue>(() => ({
    city: selectedCity ?? detectedCity ?? 'Астана', detectedCity, confirmationOpen, selectorOpen, detectedAutomatically,
    selectCity,
    confirmDetectedCity: () => selectCity(detectedCity ?? 'Астана'),
    openSelector: () => { setConfirmationOpen(false); setSelectorOpen(true); },
    closeSelector: () => setSelectorOpen(false),
  }), [selectedCity, detectedCity, confirmationOpen, selectorOpen, detectedAutomatically]);

  return <DepartureCityContext.Provider value={value}>{children}</DepartureCityContext.Provider>;
}

export function useDepartureCity() {
  const context = useContext(DepartureCityContext);
  if (!context) throw new Error('useDepartureCity должен использоваться внутри DepartureCityProvider');
  return context;
}
