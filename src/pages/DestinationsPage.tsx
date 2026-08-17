import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { PageHeader } from '../components/PageHeader';
import { destinations } from '../components/TourSections';
import { optimizedImageSrcSet, optimizedImageUrl, showTravelImageFallback } from '../utils/image';

export function DestinationsPage() {
  return <main className="min-h-screen bg-mist"><PageHeader eyebrow="Выберите настроение" title="Направления"/><section className="section-shell py-14 sm:py-20"><p className="max-w-2xl leading-7 text-slate-500">Выберите место для следующего путешествия — от спокойного пляжного отдыха до ярких городских впечатлений.</p><div className="mt-8 grid auto-rows-[220px] gap-4 md:grid-cols-4 md:auto-rows-[190px]">{destinations.map(item => <Link to={`/tours?query=${encodeURIComponent(item.name)}`} key={item.name} className={`group relative overflow-hidden rounded-3xl ${item.span}`}><img src={optimizedImageUrl(item.image, 800)} srcSet={optimizedImageSrcSet(item.image, [420, 800])} sizes="(max-width: 767px) calc(100vw - 24px), 50vw" alt={item.name} onError={showTravelImageFallback} className="size-full object-cover transition duration-700 group-hover:scale-110"/><div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent"/><div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white sm:p-6"><div><h2 className="text-2xl font-black">{item.name}</h2><p className="mt-1 text-sm text-white/70">{item.meta}</p></div><ArrowUpRight className="shrink-0"/></div></Link>)}</div></section><Footer/></main>;
}
