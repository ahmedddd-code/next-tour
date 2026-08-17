import { ArrowRight, BadgeCheck, Headphones, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { PageHeader } from '../components/PageHeader';
import { TourCard } from '../components/TourCard';
import { TourSearch } from '../components/TourSearch';
import { useTours } from '../hooks/useTours';

const quickDestinations = ['Турция', 'ОАЭ', 'Таиланд', 'Мальдивы'];

export function SearchPage() {
  const { tours } = useTours();
  const offers = tours
    .slice()
    .sort((first, second) => Number(second.isHot) - Number(first.isHot) || second.popularity - first.popularity);

  return <main className="min-h-screen bg-[#f7faf8]">
    <PageHeader eyebrow="Начните путешествие" title="Подобрать тур"/>
    <TourSearch standalone/>

    <section className="section-shell pb-14 pt-4 sm:pb-20 sm:pt-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-brand-dark">Все доступные варианты</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-navy sm:text-4xl">Все туры</h2><p className="mt-3 max-w-2xl text-slate-500">Показываем весь каталог. В каждой карточке указаны город вылета, даты, питание и актуальная стоимость.</p></div>
        <Link to="/tours" className="inline-flex shrink-0 items-center gap-2 font-black text-brand-dark">Все предложения <ArrowRight className="size-4"/></Link>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap">{quickDestinations.map(destination => <Link key={destination} to={`/tours?query=${encodeURIComponent(destination)}`} className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-navy shadow-sm transition hover:border-brand hover:text-brand-dark">{destination}</Link>)}</div>

      {offers.length > 0 ? <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{offers.map(tour => <TourCard key={tour.id} tour={tour}/>)}</div> : <div className="mt-7 rounded-3xl bg-white p-10 text-center shadow-sm"><h3 className="text-xl font-black">Предложения обновляются</h3><p className="mt-2 text-slate-500">Попробуйте выбрать другое направление или откройте полный каталог.</p></div>}
    </section>

    <section className="bg-white py-14 sm:py-20"><div className="section-shell grid gap-4 md:grid-cols-3">
      <div className="rounded-3xl bg-mist p-6"><BadgeCheck className="size-7 text-brand-dark"/><h3 className="mt-5 text-lg font-black">Проверенные варианты</h3><p className="mt-2 text-sm leading-6 text-slate-500">Показываем понятную стоимость, отель, даты и город вылета.</p></div>
      <div className="rounded-3xl bg-mist p-6"><Sparkles className="size-7 text-brand-dark"/><h3 className="mt-5 text-lg font-black">Персональный подбор</h3><p className="mt-2 text-sm leading-6 text-slate-500">AI-помощник уточнит пожелания и предложит подходящие туры.</p><Link to="/ai" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-brand-dark">Спросить AI <ArrowRight className="size-4"/></Link></div>
      <div className="rounded-3xl bg-mist p-6"><Headphones className="size-7 text-brand-dark"/><h3 className="mt-5 text-lg font-black">Помощь менеджера</h3><p className="mt-2 text-sm leading-6 text-slate-500">Поможем сравнить предложения и ответим на вопросы по поездке.</p><Link to="/chat" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-brand-dark">Написать нам <ArrowRight className="size-4"/></Link></div>
    </div></section>
    <Footer/>
  </main>;
}
