import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { CatalogFilters, filterAndSortTours, type SortOption, type TourFilters } from '../components/CatalogFilters';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { TourCard } from '../components/TourCard';
import { useTours } from '../hooks/useTours';
import { useDepartureCity } from '../hooks/useDepartureCity';
import { cityInGenitive } from '../data/kazakhstanCities';

export function ToursPage() {
  const { allTours: tours } = useTours();
  const { city, selectCity } = useDepartureCity();
  const [searchParams] = useSearchParams();
  const maxPrice = useMemo(() => Math.max(500000, Math.ceil(Math.max(0, ...tours.map(tour => tour.price)) / 50000) * 50000), [tours]);
  const countries = useMemo(() => [...new Set(tours.map(tour => tour.country))], [tours]);
  const [filters, setFilters] = useState<TourFilters>({ query: searchParams.get('query') ?? '', country: '', maxPrice, nights: '', sort: 'popularity' });
  const [visibleCount, setVisibleCount] = useState(30);
  const previousMaxPrice = useRef(maxPrice);
  useEffect(() => {
    setFilters(current => current.maxPrice === previousMaxPrice.current ? { ...current, maxPrice } : current);
    previousMaxPrice.current = maxPrice;
  }, [maxPrice]);
  const cityTours = useMemo(() => tours.filter(tour => tour.departureCity === city), [tours, city]);
  const alternativeCities = useMemo(() => [...new Set(tours.map(tour => tour.departureCity))].filter(item => item !== city).slice(0, 3), [tours, city]);
  const catalogSource = useMemo(() => cityTours.length >= 2 ? cityTours : [...cityTours, ...tours.filter(tour => alternativeCities.includes(tour.departureCity))], [cityTours, tours, alternativeCities]);
  const filteredTours = useMemo(() => filterAndSortTours(catalogSource, filters), [catalogSource, filters]);

  return <main className="min-h-screen bg-[#f7faf8]">
    <Helmet><title>Каталог туров — NEXT TOUR</title><meta name="description" content="Горящие и премиальные туры с вылетом из Москвы, Алматы и Астаны."/><meta property="og:title" content="Каталог туров NEXT TOUR"/></Helmet>
    <div className="relative h-72 overflow-hidden bg-navy"><div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(0,200,83,.28),transparent_35%)]"/><Header/><div className="section-shell relative flex h-full flex-col justify-end pb-12 pt-24 text-white"><p className="mb-2 text-xs font-black uppercase tracking-[.2em] text-brand">Путешествие начинается здесь</p><h1 className="text-4xl font-black tracking-[-.045em] sm:text-5xl">Каталог туров</h1><p className="mt-3 text-white/60">Проверенные отели и честные цены без скрытых доплат</p></div></div>
    <div className="section-shell grid gap-7 py-12 lg:grid-cols-[280px_1fr]">
      <CatalogFilters filters={filters} countries={countries} maxAvailablePrice={maxPrice} resultCount={filteredTours.length} onChange={setFilters}/>
      <section>
        {cityTours.length < 2 && <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><strong>Из {cityInGenitive(city)} сейчас мало предложений.</strong><span className="ml-1">Ниже показываем ближайшие доступные варианты.</span><div className="mt-3 flex flex-wrap gap-2">{alternativeCities.map(item => <button key={item} onClick={() => selectCity(item)} className="rounded-full bg-white px-3 py-2 text-xs font-black text-blue-700 shadow-sm hover:bg-blue-100">Вылет из {item}</button>)}</div></div>}
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p className="text-sm text-slate-500">Найдено <strong className="text-navy">{filteredTours.length}</strong> предложений</p><select value={filters.sort} onChange={e => setFilters(current => ({ ...current, sort: e.target.value as SortOption }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-navy outline-none focus:border-brand"><option value="popularity">По популярности</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option><option value="rating">По рейтингу</option></select></div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{filteredTours.slice(0, visibleCount).map(tour => <TourCard key={tour.id} tour={tour}/>)}</div>
        {visibleCount < filteredTours.length && <div className="mt-8 text-center"><button onClick={() => setVisibleCount(count => count + 30)} className="rounded-2xl bg-navy px-7 py-3.5 text-sm font-black text-white transition hover:bg-brand-dark">Показать ещё 30 туров</button></div>}
        {filteredTours.length === 0 && <div className="rounded-3xl bg-white px-6 py-20 text-center"><p className="text-xl font-black">Подходящих туров пока нет</p><p className="mt-2 text-slate-500">Попробуйте изменить параметры поиска.</p></div>}
      </section>
    </div>
    <Footer/>
  </main>;
}
