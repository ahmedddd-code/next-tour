import { useState } from 'react';

export function TourGallery({ images, title }: { images: string[]; title: string }) {
  const [activeImage, setActiveImage] = useState(images[0]);
  return <div className="grid gap-3 md:grid-cols-[1fr_180px]">
    <div className="h-[320px] overflow-hidden rounded-3xl sm:h-[480px]"><img src={activeImage} alt={title} className="size-full object-cover"/></div>
    <div className="grid grid-cols-3 gap-3 md:grid-cols-1">{images.map((image, index) => <button key={image} onClick={() => setActiveImage(image)} className={`h-24 overflow-hidden rounded-2xl border-2 transition md:h-[152px] ${activeImage === image ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'}`} aria-label={`Показать фото ${index + 1}`}><img src={image} alt="" loading="lazy" className="size-full object-cover"/></button>)}</div>
  </div>;
}
