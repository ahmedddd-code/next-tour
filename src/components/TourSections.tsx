import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tours as defaultTours } from '../data/tours';
import { useTours } from '../hooks/useTours';
import { useDepartureCity } from '../hooks/useDepartureCity';
import { TourCard } from './TourCard';
import { cityInGenitive } from '../data/kazakhstanCities';
import { optimizedImageSrcSet, optimizedImageUrl } from '../utils/image';

const destinations = [
  { name: 'Мальдивы', meta: 'Белый песок и тишина', image: defaultTours[0].images[0], span: 'md:col-span-2 md:row-span-2' },
  { name: 'Бали', meta: 'Остров вдохновения', image: defaultTours[4].images[0], span: '' },
  { name: 'Дубай', meta: 'Город будущего', image: defaultTours[3].images[0], span: '' },
  { name: 'Турция', meta: 'Всё включено', image: defaultTours[1].images[0], span: '' },
  { name: 'Таиланд', meta: 'Тропики круглый год', image: defaultTours[2].images[0], span: '' },
];

function Heading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-3 text-xs font-black uppercase tracking-[.2em] text-brand-dark">{eyebrow}</p><h2 className="text-3xl font-black tracking-[-.04em] text-navy sm:text-5xl">{title}</h2></div><p className="max-w-md leading-7 text-slate-500">{text}</p></div>;
}

export function TourSections() {
  const { tours } = useTours();
  const { city, selectCity } = useDepartureCity();
  const cityTours = tours.filter(tour => tour.departureCity === city);
  const alternatives = [...new Set(tours.map(tour => tour.departureCity))].filter(item => item !== city).slice(0, 3);
  const partnerTours = tours.filter(tour => Boolean(tour.partnerSource));
  const cityPartnerTours = partnerTours.filter(tour => tour.departureCity === city);
  const featuredTours = (cityPartnerTours.length ? cityPartnerTours : partnerTours.length ? partnerTours : cityTours).slice(0, 3);
  const showingAnotherCity = cityPartnerTours.length === 0 && partnerTours.length > 0;
  return <>
    <section id="hot" className="section-shell section-space scroll-mt-24">
      <Heading eyebrow={showingAnotherCity ? 'Предложения туроператоров' : `Вылет из ${cityInGenitive(city)}`} title="Горящие туры 🔥" text={showingAnotherCity ? 'Сразу показываем актуальные партнёрские туры. Город вылета указан в каждой карточке.' : 'Актуальные предложения партнёров из выбранного города — цены обновляются каждый день.'}/>
      {showingAnotherCity && <div className="mb-7 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><strong>Из {cityInGenitive(city)} партнёрских туров пока нет.</strong><span className="ml-1">Показываем доступные варианты из других городов:</span><div className="mt-3 flex flex-wrap gap-2">{alternatives.map(item => <button key={item} onClick={() => selectCity(item)} className="rounded-full bg-white px-3 py-2 text-xs font-black text-blue-700 shadow-sm hover:bg-blue-100">{item}</button>)}</div></div>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{featuredTours.map(tour => <TourCard key={tour.id} tour={tour}/>)}</div>
      <div className="mt-10 text-center"><Link to="/tours" className="inline-flex items-center gap-2 rounded-full bg-navy px-7 py-4 text-sm font-extrabold text-white transition hover:bg-brand-dark">Смотреть все туры <ArrowUpRight className="size-4"/></Link></div>
    </section>
    <section id="destinations" className="render-lazy scroll-mt-24 bg-mist py-24"><div className="section-shell"><Heading eyebrow="Куда поехать" title="Популярные направления" text="Места, в которые хочется возвращаться. Выберите настроение — детали мы берём на себя."/>
      <div className="grid auto-rows-[220px] gap-4 md:grid-cols-4 md:auto-rows-[190px]">{destinations.map(item => <Link to="/tours" key={item.name} className={`group relative overflow-hidden rounded-3xl ${item.span}`}><img src={optimizedImageUrl(item.image, 800)} srcSet={optimizedImageSrcSet(item.image, [420, 800])} sizes="(max-width: 767px) calc(100vw - 32px), 50vw" alt={item.name} loading="lazy" decoding="async" className="size-full object-cover transition duration-700 group-hover:scale-110"/><div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent"/><div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white"><div><h3 className="text-2xl font-black">{item.name}</h3><p className="mt-1 text-sm text-white/70">{item.meta}</p></div><ArrowUpRight className="transition group-hover:translate-x-1 group-hover:-translate-y-1"/></div></Link>)}</div>
    </div></section>
  </>;
}
