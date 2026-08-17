import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { optimizedImageSrcSet, optimizedImageUrl } from '../utils/image';

export function TourGallery({ images, title }: { images: string[]; title: string }) {
  const [availableImages, setAvailableImages] = useState(images);
  const [activeImage, setActiveImage] = useState(images[0]);
  useEffect(() => { setAvailableImages(images); setActiveImage(images[0]); }, [images]);
  const removeUnavailable = (image: string) => setAvailableImages(current => {
    const next = current.filter(candidate => candidate !== image);
    if (activeImage === image) setActiveImage(next[0] ?? '/images/tour-placeholder.svg');
    return next.length ? next : ['/images/tour-placeholder.svg'];
  });
  const activeIndex = Math.max(0, availableImages.indexOf(activeImage));
  const selectRelative = (direction: number) => setActiveImage(availableImages[(activeIndex + direction + availableImages.length) % availableImages.length]);
  return <div className="space-y-3">
    <div className="group relative h-[clamp(240px,65vw,520px)] overflow-hidden rounded-2xl bg-slate-100 sm:rounded-3xl"><img src={optimizedImageUrl(activeImage, 1400, 82)} srcSet={optimizedImageSrcSet(activeImage, [640, 960, 1400])} sizes="(max-width: 767px) calc(100vw - 24px), 1200px" alt={`${title}, фото ${activeIndex + 1}`} decoding="async" onError={() => removeUnavailable(activeImage)} className="size-full object-cover"/>
      {availableImages.length > 1 && <><button type="button" onClick={() => selectRelative(-1)} className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-navy/65 text-white shadow-lg backdrop-blur transition hover:bg-navy sm:left-5 sm:size-12" aria-label="Предыдущее фото"><ChevronLeft className="size-5 sm:size-6"/></button><button type="button" onClick={() => selectRelative(1)} className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-navy/65 text-white shadow-lg backdrop-blur transition hover:bg-navy sm:right-5 sm:size-12" aria-label="Следующее фото"><ChevronRight className="size-5 sm:size-6"/></button><span className="absolute bottom-3 right-3 rounded-full bg-navy/70 px-3 py-1.5 text-xs font-black text-white backdrop-blur sm:bottom-5 sm:right-5">{activeIndex + 1} / {availableImages.length}</span></>}
    </div>
    {availableImages.length > 1 && <div className="flex snap-x gap-2 overflow-x-auto pb-2 sm:gap-3">{availableImages.map((image, index) => <button key={image} type="button" onClick={() => setActiveImage(image)} className={`h-20 w-28 shrink-0 snap-start overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-36 sm:rounded-2xl ${activeImage === image ? 'border-brand opacity-100' : 'border-transparent opacity-65 hover:opacity-100'}`} aria-label={`Показать фото отеля ${index + 1} из ${availableImages.length}`}><img src={optimizedImageUrl(image, 360)} alt="" loading="lazy" decoding="async" onError={() => removeUnavailable(image)} className="size-full object-cover"/></button>)}</div>}
  </div>;
}
