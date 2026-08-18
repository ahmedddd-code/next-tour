import { Check, Info } from 'lucide-react';
import { formatPrice, type Tour } from '../data/tours';

export function TourPriceBreakdown({ tour }: { tour: Tour }) {
  const fuel = tour.fuelSurcharge ?? 0;
  const base = Math.max(0, tour.price - fuel);
  const parts = [
    ['Перелёт туда и обратно', Math.round(base * .42)],
    [`Проживание, ${tour.nights} ночей`, Math.round(base * .43)],
    ['Питание и трансфер', base - Math.round(base * .42) - Math.round(base * .43)],
    ['Топливный сбор', fuel],
  ].filter(([, value]) => Number(value) > 0) as Array<[string, number]>;
  return <section className="rounded-3xl bg-white p-6 sm:p-8"><h2 className="text-2xl font-black">Из чего складывается цена</h2><p className="mt-2 flex gap-2 text-xs leading-5 text-slate-400"><Info className="mt-0.5 size-4 shrink-0"/>Разбивка ориентировочная. Итоговая цена за двоих фиксируется менеджером перед оплатой.</p><div className="mt-5 divide-y divide-slate-100">{parts.map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3 text-sm"><span className="text-slate-600">{label}</span><strong>{formatPrice(value)}</strong></div>)}<div className="flex justify-between gap-4 py-4 text-lg"><strong>Итого, без скрытых доплат</strong><strong className="text-brand-dark">{formatPrice(tour.price)}</strong></div></div><p className="mt-3 flex items-center gap-2 text-sm font-bold text-brand-dark"><Check className="size-4"/>Все обязательные платежи уже учтены</p></section>;
}
