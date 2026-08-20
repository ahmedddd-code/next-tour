import { Search, SlidersHorizontal } from 'lucide-react';
import type { Tour } from '../data/tours';
import { matchesRequestedMonth } from '../utils/tourDate';
import { TripMonthPicker } from './TripMonthPicker';

export type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'popularity';
export type TourFilters = { query: string; country: string; departure: string; date: string; tourists: number; maxPrice: number; nights: string; sort: SortOption };

type Props = {
  filters: TourFilters;
  countries: string[];
  maxAvailablePrice: number;
  resultCount: number;
  onChange: (filters: TourFilters) => void;
};

export function filterAndSortTours(items: Tour[], filters: TourFilters) {
  return items.filter(tour => {
    const queryWords = filters.query.toLowerCase().split(/[\s,\/]+/).filter(Boolean);
    const searchableText = `${tour.hotel} ${tour.country} ${tour.resort} ${tour.city ?? ''} ${tour.departureCity}`.toLowerCase();
    const matchesName = queryWords.every(word => searchableText.includes(word));
    const matchesNights = !filters.nights || (filters.nights === '10+' ? tour.nights >= 10 : tour.nights === Number(filters.nights));
    const partyPrice = Math.round(tour.price * Math.max(1, filters.tourists) / 2);
    return matchesName && (!filters.country || tour.country === filters.country) && (!filters.departure || tour.departureCity === filters.departure) && matchesRequestedMonth(tour.dates, filters.date) && partyPrice <= filters.maxPrice && matchesNights;
  }).sort((a, b) => {
    if (filters.sort === 'price-asc') return a.price - b.price;
    if (filters.sort === 'price-desc') return b.price - a.price;
    if (filters.sort === 'rating') return b.rating - a.rating;
    return b.popularity - a.popularity;
  });
}

export function CatalogFilters({ filters, countries, maxAvailablePrice, resultCount, onChange }: Props) {
  const update = <K extends keyof TourFilters>(key: K, value: TourFilters[K]) => onChange({ ...filters, [key]: value });
  const inputClass = 'h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-navy outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10';
  return <aside className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(7,29,52,.07)] lg:sticky lg:top-6 lg:self-start">
    <div className="mb-5 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-black"><SlidersHorizontal className="size-5 text-brand"/>Фильтры</h2><span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-brand-dark">{resultCount} туров</span></div>
    <div className="space-y-5">
      <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Поиск</span><div className="relative"><Search className="absolute left-3 top-3.5 size-4 text-slate-400"/><input value={filters.query} onChange={e => update('query', e.target.value)} placeholder="Отель или курорт" className={`${inputClass} pl-10`}/></div></label>
      <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Страна</span><select value={filters.country} onChange={e => update('country', e.target.value)} className={inputClass}><option value="">Все страны</option>{countries.map(country => <option key={country}>{country}</option>)}</select></label>
      <TripMonthPicker value={filters.date} onChange={value => update('date', value)}/>
      <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Туристы</span><select value={filters.tourists} onChange={e => update('tourists', Number(e.target.value))} className={inputClass}>{[1,2,3,4,5,6].map(value => <option key={value} value={value}>{value} чел.</option>)}</select></label>
      <label className="block"><span className="mb-2 flex justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400"><span>Цена до</span><span className="text-brand-dark">{new Intl.NumberFormat('kk-KZ').format(filters.maxPrice)} ₸</span></span><input type="range" min="500000" max={maxAvailablePrice} step="50000" value={filters.maxPrice} onChange={e => update('maxPrice', Number(e.target.value))} className="w-full accent-brand"/></label>
      <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Количество ночей</span><select value={filters.nights} onChange={e => update('nights', e.target.value)} className={inputClass}><option value="">Любое</option>{[6,7,8,9].map(n => <option key={n} value={n}>{n} ночей</option>)}<option value="10+">10 и более</option></select></label>
      <button onClick={() => onChange({ query: '', country: '', departure: '', date: '', tourists: 2, maxPrice: maxAvailablePrice, nights: '', sort: 'popularity' })} className="w-full rounded-xl bg-mist py-3 text-sm font-extrabold text-brand-dark transition hover:bg-brand/15">Сбросить фильтры</button>
    </div>
  </aside>;
}
