import { Scale, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, type Tour } from '../data/tours';
import { useCompare } from '../hooks/useTourMemory';

const fields = [['Направление', (tour: Tour) => `${tour.country}, ${tour.resort}`], ['Даты', (tour: Tour) => tour.dates], ['Ночей', (tour: Tour) => String(tour.nights)], ['Питание', (tour: Tour) => tour.meal], ['Рейтинг', (tour: Tour) => String(tour.rating)], ['Цена за двоих', (tour: Tour) => formatPrice(tour.price)]] as const;

export function TourComparison({ tours }: { tours: Tour[] }) {
  const { compareIds, toggleCompare, clearCompare } = useCompare();
  const selected = compareIds.map(id => tours.find(tour => tour.id === id)).filter((tour): tour is Tour => Boolean(tour));
  if (!selected.length) return null;
  return <section id="comparison" className="mb-7 scroll-mt-24 rounded-3xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-black text-blue-950"><Scale className="size-5"/>Сравнение туров ({selected.length}/3)</h2><button onClick={clearCompare} className="text-xs font-black text-blue-700">Очистить</button></div>
    <div className="mt-4 grid gap-3 sm:hidden">{selected.map(tour => <article key={tour.id} className="rounded-2xl bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><h3 className="font-black leading-tight text-navy">{tour.hotel}</h3><button onClick={() => toggleCompare(tour.id)} aria-label={`Убрать ${tour.hotel}`} className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-slate-500"><X className="size-4"/></button></div><dl className="mt-3 divide-y divide-slate-100">{fields.map(([label, value]) => <div key={label} className="flex justify-between gap-3 py-2 text-xs"><dt className="text-slate-400">{label}</dt><dd className="text-right font-bold text-navy">{value(tour)}</dd></div>)}</dl><Link to={`/tour/${tour.id}`} className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-4 text-sm font-black text-white">Открыть тур</Link></article>)}</div>
    <div className="mt-4 hidden overflow-x-auto sm:block"><table className="w-full min-w-[560px] text-left text-sm"><tbody>
      {([['Отель', (tour: Tour) => tour.hotel], ...fields] as const).map(([label, value]) => <tr key={label} className="border-t border-blue-100"><th className="w-36 py-3 pr-3 text-xs text-blue-700">{label}</th>{selected.map(tour => <td key={tour.id} className="min-w-40 px-3 py-3 font-bold text-navy">{value(tour)}</td>)}</tr>)}
      <tr className="border-t border-blue-100"><th/><>{selected.map(tour => <td key={tour.id} className="px-3 pt-3"><div className="flex gap-2"><Link to={`/tour/${tour.id}`} className="rounded-xl bg-blue-700 px-3 py-2 text-xs font-black text-white">Открыть</Link><button onClick={() => toggleCompare(tour.id)} aria-label={`Убрать ${tour.hotel}`} className="grid size-8 place-items-center rounded-lg bg-white text-slate-500"><X className="size-4"/></button></div></td>)}</></tr>
    </tbody></table></div>
  </section>;
}
