import { ArrowLeft, CalendarDays, Check, ExternalLink, Flame, MapPin, Plane, Star, Utensils } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { TourCard } from '../components/TourCard';
import { TourGallery } from '../components/TourGallery';
import { TourInquiryForm } from '../components/TourInquiryForm';
import { formatPrice } from '../data/tours';
import { useTours } from '../hooks/useTours';
import { BookingsProvider } from '../hooks/useBookings';
import { NotFoundPage } from './NotFoundPage';
import { useRecentlyViewed } from '../hooks/useTourMemory';

export function TourPage() {
  return <BookingsProvider><TourContent/></BookingsProvider>;
}

function TourContent() {
  const { tours, allTours } = useTours();
  const { id } = useParams();
  const tour = allTours.find(item => item.id === id);
  const { rememberTour } = useRecentlyViewed();
  useEffect(() => { if (tour) rememberTour(tour.id); }, [tour, rememberTour]);
  if (!tour) return <NotFoundPage/>;
  const similar = tours.filter(item => item.id !== tour.id && (item.country === tour.country || item.price <= tour.price * 1.25)).slice(0, 3);

  return <main className="min-h-screen bg-[#f7faf8]">
    <Helmet><title>{tour.hotel} — тур от {formatPrice(tour.price)} | NEXT TOUR</title><meta name="description" content={`${tour.country}, ${tour.resort}. ${tour.nights} ночей, ${tour.meal}. ${tour.description}`}/><meta property="og:title" content={`${tour.hotel} — NEXT TOUR`}/><meta property="og:image" content={tour.images[0]}/></Helmet>
    <div className="relative h-20 bg-navy"><Header/></div>
    <div className="section-shell py-8 sm:py-12">
      <Link to="/tours" className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-brand-dark"><ArrowLeft className="size-4"/>Назад к каталогу</Link>
      <div className="mt-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><div className="flex flex-wrap items-center gap-2">{tour.isHot && <span className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-black text-white"><Flame className="size-3.5 fill-white"/>Горящий тур</span>}<span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700"><Star className="size-3.5 fill-amber-400 text-amber-400"/>{tour.partnerSource ? `${Math.round(tour.rating)}★ · категория отеля` : `${tour.rating}${tour.reviews > 0 ? ` · ${tour.reviews} отзывов` : ''}`}</span></div><h1 className="mt-4 text-3xl font-black tracking-[-.045em] text-navy sm:text-5xl">{tour.hotel}</h1><p className="mt-3 flex items-center gap-2 text-slate-500"><MapPin className="size-4 text-brand"/>{tour.country}, {tour.resort}</p></div><div className="lg:text-right"><p className="text-sm text-slate-400">Цена за двоих</p><p className="text-3xl font-black text-navy">{formatPrice(tour.price)}</p>{tour.oldPrice && <p className="text-sm text-slate-400 line-through">{formatPrice(tour.oldPrice)}</p>}</div></div>
      <div className="mt-8"><TourGallery images={tour.images} title={tour.hotel} isDestinationFallback={tour.usesDestinationPhoto}/></div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_400px] 2xl:gap-10"><div className="space-y-7">
        <section className="grid grid-cols-2 gap-3 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-4">{[[Plane, 'Вылет', `${tour.departureCity}${tour.airline ? ` · ${tour.airline}` : ''}`], [CalendarDays, 'Даты', tour.dates], [CalendarDays, 'Длительность', `${tour.nights} ночей`], [Utensils, 'Питание', tour.meal]].map(([Icon, label, value]) => { const ItemIcon = Icon as typeof Plane; return <div key={String(label)} className="rounded-2xl bg-mist p-4"><ItemIcon className="size-5 text-brand"/><p className="mt-3 text-xs font-bold text-slate-400">{String(label)}</p><p className="mt-1 text-sm font-black text-navy">{String(value)}</p></div>; })}</section>
        <section className="rounded-3xl bg-white p-6 sm:p-8"><h2 className="text-2xl font-black">Об отеле и туре</h2><p className="mt-4 leading-7 text-slate-600">{tour.description}</p></section>
        {tour.sourceUrl && <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6 sm:p-8"><h2 className="text-lg font-black text-navy">Проверка цены</h2><p className="mt-2 text-sm leading-6 text-slate-600">Цена проверена {tour.priceCheckedAt ? new Date(tour.priceCheckedAt).toLocaleString('ru-RU') : 'при последнем обновлении'}.{tour.sourcePrice && tour.sourceCurrency ? ` Исходная цена: ${new Intl.NumberFormat('ru-RU').format(tour.sourcePrice)} ${tour.sourceCurrency}.` : ''}</p><a href={tour.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-blue-700 shadow-sm transition hover:bg-blue-100">Проверить предложение у туроператора <ExternalLink className="size-4"/></a></section>}
        {tour.partnerOffers && tour.partnerOffers.length > 1 && <section className="rounded-3xl bg-white p-6 sm:p-8"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-brand-dark">Сравнение операторов</p><h2 className="mt-2 text-2xl font-black">Все предложения в одной карточке</h2></div><span className="rounded-full bg-brand/10 px-3 py-1.5 text-xs font-black text-brand-dark">Лучшая цена выбрана</span></div><div className="mt-6 divide-y divide-slate-100">{tour.partnerOffers.map((offer, index) => <div key={`${offer.source}:${offer.externalOfferId}`} className="flex items-center justify-between gap-4 py-4"><div><p className="font-black capitalize text-navy">{offer.source}</p><p className="mt-1 text-xs text-slate-400">{offer.availability}</p></div><div className="text-right"><p className="text-lg font-black text-navy">{formatPrice(offer.price)}</p>{index === 0 && <span className="text-xs font-black text-brand-dark">Лучшая цена</span>}</div></div>)}</div></section>}
        <section className="rounded-3xl bg-white p-6 sm:p-8"><h2 className="text-2xl font-black">Что входит в стоимость</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{tour.included.map(item => <p key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-600"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand/10"><Check className="size-4 text-brand-dark"/></span>{item}</p>)}</div></section>
      </div><TourInquiryForm tour={tour}/></div>
      {similar.length > 0 && <section className="pt-20"><p className="text-xs font-black uppercase tracking-[.2em] text-brand-dark">Вам может понравиться</p><h2 className="mt-3 text-3xl font-black tracking-[-.035em]">Похожие туры</h2><div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{similar.map(item => <TourCard key={item.id} tour={item}/>)}</div></section>}
    </div><Footer/>
  </main>;
}
