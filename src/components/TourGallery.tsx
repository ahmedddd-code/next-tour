import { useEffect, useState } from 'react';
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
  return <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px] 2xl:grid-cols-[minmax(0,1fr)_220px]">
    <div className="h-[clamp(240px,65vw,480px)] overflow-hidden rounded-2xl sm:rounded-3xl"><img src={optimizedImageUrl(activeImage, 1200, 80)} srcSet={optimizedImageSrcSet(activeImage, [640, 960, 1200])} sizes="(max-width: 767px) calc(100vw - 24px), 980px" alt={title} decoding="async" onError={() => removeUnavailable(activeImage)} className="size-full object-cover"/></div>
    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-1">{availableImages.map((image, index) => <button key={image} onClick={() => setActiveImage(image)} className={`relative h-20 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:rounded-2xl md:h-[152px] ${activeImage === image ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'}`} aria-label={`Показать фото отеля ${index + 1}`}><img src={optimizedImageUrl(image, 360)} alt="" loading="lazy" decoding="async" onError={() => removeUnavailable(image)} className="size-full object-cover"/><span className="absolute inset-x-1 bottom-1 truncate rounded-full bg-navy/80 px-2 py-1 text-[9px] font-bold text-white backdrop-blur sm:inset-x-auto sm:bottom-1.5 sm:left-1.5 sm:text-[10px]">{index === 0 ? 'Главное фото' : 'Фото отеля'}</span></button>)}</div>
  </div>;
}
