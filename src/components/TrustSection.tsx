import { BadgeCheck, Building2, CreditCard, Headphones, ShieldCheck } from 'lucide-react';

const items = [
  [ShieldCheck, 'Цена без сюрпризов', 'Показываем обязательные платежи до бронирования.'],
  [BadgeCheck, 'Проверенные предложения', 'Проверяем отели и актуальность цен туроператоров.'],
  [CreditCard, 'Безопасная оплата', 'Подтверждаем итоговую сумму перед оплатой.'],
  [Headphones, 'Поддержка 24/7', 'Остаёмся на связи до и во время путешествия.'],
];
export function TrustSection() {
  return <section className="bg-navy py-20 text-white"><div className="section-shell"><p className="text-xs font-black uppercase tracking-[.2em] text-brand">Почему NEXT TOUR</p><div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end"><h2 className="max-w-2xl text-3xl font-black tracking-[-.04em] sm:text-5xl">С нами спокойно на каждом этапе</h2><p className="flex items-center gap-2 text-sm text-white/60"><Building2 className="size-5 text-brand"/>Офис: Алматы, проспект Абая, 52</p></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map(([Icon, title, text]) => { const ItemIcon = Icon as typeof ShieldCheck; return <article key={String(title)} className="rounded-3xl border border-white/10 bg-white/5 p-6"><ItemIcon className="size-8 text-brand"/><h3 className="mt-5 text-lg font-black">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-white/55">{String(text)}</p></article>; })}</div></div></section>;
}
