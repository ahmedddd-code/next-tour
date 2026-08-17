import { ArrowRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../data/tours';
import { useRecentlyViewed } from '../hooks/useTourMemory';
import { useTours } from '../hooks/useTours';
import { optimizedImageUrl, showTourImageFallback } from '../utils/image';

export function RecentlyViewed() {
  const { tours } = useTours();
  const { recentIds } = useRecentlyViewed();
  const recentTours = recentIds.map(id => tours.find(tour => tour.id === id)).filter(tour => tour !== undefined).slice(0, 3);
  if (!recentTours.length) return null;

  return <section className="section-shell pb-5 pt-2 sm:pb-8"><div className="flex items-center gap-2"><Clock3 className="size-5 text-brand-dark"/><h2 className="text-lg font-black">Недавно смотрели</h2></div><div className="mt-4 grid gap-3 md:grid-cols-3">{recentTours.map(tour => <Link key={tour.id} to={`/tour/${tour.id}`} className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-3 shadow-sm transition hover:-translate-y-0.5"><img src={optimizedImageUrl(tour.coverImage ?? tour.images[0], 180)} alt="" onError={showTourImageFallback} className="size-16 shrink-0 rounded-xl object-cover"/><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-navy">{tour.hotel}</strong><span className="mt-1 block text-xs font-black text-brand-dark">{formatPrice(tour.price)}</span></span><ArrowRight className="size-4 shrink-0 text-slate-300"/></Link>)}</div></section>;
}
