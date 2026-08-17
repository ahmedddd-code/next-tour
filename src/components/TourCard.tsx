import { CalendarDays, Flame, Heart, MapPin, Plane, Star } from 'lucide-react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, type Tour } from '../data/tours';
import { optimizedImageSrcSet, optimizedImageUrl, showTourImageFallback } from '../utils/image';
import { useFavorites } from '../hooks/useTourMemory';

type Props = { tour: Tour };

export const TourCard = memo(function TourCard({ tour }: Props) {
  const coverImage = tour.coverImage ?? tour.images[0];
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(tour.id);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_14px_45px_rgba(7,29,52,.08)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(7,29,52,.15)]">
      <Link to={`/tour/${tour.id}`} className="relative block h-56 overflow-hidden sm:h-64 2xl:h-72">
        <img src={optimizedImageUrl(coverImage, 720)} srcSet={optimizedImageSrcSet(coverImage, [420, 720])} sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1279px) 50vw, 380px" alt={tour.hotel} loading="lazy" decoding="async" onError={showTourImageFallback} className="size-full object-cover transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/55 via-transparent to-transparent" />
        {tour.isHot && <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-brand px-3 py-2 text-xs font-black text-white shadow-lg"><Flame className="size-3.5 fill-white" /> Горящий тур</span>}
        <span className="absolute right-4 top-4 rounded-full bg-navy/90 px-3 py-2 text-xs font-black text-white shadow-lg backdrop-blur">Next Tour</span>
        {tour.bestPrice && <span className="absolute bottom-4 right-4 rounded-full bg-brand px-3 py-1.5 text-xs font-black text-white shadow-lg">Лучшая цена</span>}
        <span className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-navy"><Star className="size-3.5 fill-amber-400 text-amber-400" />{tour.partnerSource ? `${Math.round(tour.rating)}★` : tour.rating}{!tour.partnerSource && tour.reviews > 0 && <span className="font-medium text-slate-400">({tour.reviews})</span>}</span>
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-dark"><MapPin className="size-3.5" />{tour.country} · {tour.resort}</p>
        <div className="mt-2 flex items-start gap-2"><Link to={`/tour/${tour.id}`} className="min-w-0 flex-1"><h3 className="text-xl font-black leading-tight tracking-[-.025em] text-navy transition group-hover:text-brand-dark">{tour.hotel}</h3></Link><button onClick={() => toggleFavorite(tour.id, tour.price)} className={`grid size-10 shrink-0 place-items-center rounded-full transition ${favorite ? 'bg-red-50 text-red-500' : 'bg-mist text-slate-400 hover:text-red-500'}`} aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'} aria-pressed={favorite}><Heart className={`size-5 ${favorite ? 'fill-current' : ''}`}/></button></div>
        <div className="mt-4 grid gap-2 text-sm text-slate-500 min-[390px]:grid-cols-2">
          <span className="flex items-center gap-1.5"><Plane className="size-4 text-slate-400" />из {tour.departureCity}</span>
          <span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-slate-400" />{tour.dates}</span>
        </div>
        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>{tour.oldPrice && <p className="text-xs text-slate-400 line-through">{formatPrice(tour.oldPrice)}</p>}<p className="text-2xl font-black text-navy">{formatPrice(tour.price)}</p><p className="text-[11px] text-slate-400">за двоих · {tour.nights} ночей{tour.partnerOffers && tour.partnerOffers.length > 1 ? ` · ${tour.partnerOffers.length} оператора` : ''}</p></div>
        </div>
        <div className="mt-5 grid gap-2">
          <Link to={`/tour/${tour.id}`} className="flex items-center justify-center rounded-2xl border border-brand/25 px-5 py-3 text-sm font-extrabold text-brand-dark transition hover:bg-brand/5">Подробнее</Link>
          <Link to={`/tour/${tour.id}`} className="flex items-center justify-center rounded-2xl bg-brand px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-brand-dark">Забронировать в Next Tour</Link>
        </div>
      </div>
    </article>
  );
});
