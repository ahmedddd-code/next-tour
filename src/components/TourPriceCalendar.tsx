import { CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, type Tour } from '../data/tours';

export function TourPriceCalendar({ tour, tours }: { tour: Tour; tours: Tour[] }) {
  const alternatives = tours.filter(item => item.country === tour.country && item.departureCity === tour.departureCity).sort((a, b) => a.price - b.price).slice(0, 6);
  if (alternatives.length < 2) return null;
  const lowest = Math.min(...alternatives.map(item => item.price));
  return <section className="rounded-3xl bg-white p-6 sm:p-8"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-brand/10"><CalendarDays className="size-5 text-brand-dark"/></span><div><h2 className="text-2xl font-black">Цены на другие даты</h2><p className="text-sm text-slate-500">Реальные предложения из каталога с вылетом из {tour.departureCity}</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{alternatives.map(item => <Link key={item.id} to={`/tour/${item.id}`} className={`rounded-2xl border p-4 transition hover:border-brand ${item.id === tour.id ? 'border-brand bg-brand/5' : 'border-slate-100'}`}><p className="text-xs font-bold text-slate-500">{item.dates}</p><p className="mt-1 font-black">{formatPrice(item.price)}</p>{item.price === lowest && <span className="mt-2 inline-block rounded-full bg-brand px-2 py-1 text-[10px] font-black text-white">Лучшая цена</span>}</Link>)}</div></section>;
}
