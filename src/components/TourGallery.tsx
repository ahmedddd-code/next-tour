import { useEffect, useState } from 'react';
import { optimizedImageSrcSet, optimizedImageUrl } from '../utils/image';

export function TourGallery({ images, title }: { images: string[]; title: string }) {
  const [activeImage, setActiveImage] = useState(images[0]);
  useEffect(() => setActiveImage(images[0]), [images]);
  return <div className="grid gap-3 md:grid-cols-[1fr_180px]">
    <div className="h-[320px] overflow-hidden rounded-3xl sm:h-[480px]"><img src={optimizedImageUrl(activeImage, 1200, 80)} srcSet={optimizedImageSrcSet(activeImage, [640, 960, 1200])} sizes="(max-width: 767px) calc(100vw - 32px), 980px" alt={title} decoding="async" className="size-full object-cover"/></div>
    <div className="grid grid-cols-3 gap-3 md:grid-cols-1">{images.map((image, index) => <button key={image} onClick={() => setActiveImage(image)} className={`relative h-24 overflow-hidden rounded-2xl border-2 transition md:h-[152px] ${activeImage === image ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'}`} aria-label={`Показать фото ${index === 0 ? 'города или курорта' : 'отеля'} ${index + 1}`}><img src={optimizedImageUrl(image, 360)} alt="" loading="lazy" decoding="async" className="size-full object-cover"/><span className="absolute bottom-1.5 left-1.5 rounded-full bg-navy/80 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">{index === 0 ? 'Город / курорт' : 'Отель'}</span></button>)}</div>
  </div>;
}
