import { useMemo } from 'react';
import { Edit3, Eye, EyeOff, Flame, Images, TriangleAlert, Trash2 } from 'lucide-react';
import { formatPrice, type Tour } from '../data/tours';
import { optimizedImageUrl, showTourImageFallback } from '../utils/image';
import { withUniqueTourCovers } from '../utils/tourImages';

type Props = {
  tours: Tour[];
  onEdit: (tour: Tour) => void;
  onToggleHidden: (tour: Tour) => void;
  onRemove: (tour: Tour) => void;
};

const fallbackPattern = /tour-placeholder\.svg|picsum\.photos|photo-1500530855697-b586d89ba3ee/i;

export function AdminTourList({ tours, onEdit, onToggleHidden, onRemove }: Props) {
  const previews = useMemo(() => new Map(withUniqueTourCovers(tours).map(tour => [tour.id, tour.coverImage ?? tour.images[0]])), [tours]);

  return <div className="space-y-3">{tours.map(tour => {
    const sourceImages = [...new Set(tour.images.filter(Boolean))];
    const hasFallback = sourceImages.some(image => fallbackPattern.test(image));
    const syncedAt = tour.syncedAt ? new Date(tour.syncedAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : null;
    return <article key={tour.id} className={`flex flex-col gap-4 rounded-2xl border bg-white p-3 shadow-sm sm:flex-row sm:items-start ${tour.isHidden ? 'border-slate-200 opacity-65' : 'border-slate-100'}`}>
      <div className="min-w-0 shrink-0 sm:w-32">
        <img src={optimizedImageUrl(previews.get(tour.id), 320)} alt={tour.hotel} onError={showTourImageFallback} className="h-32 w-full rounded-xl object-cover sm:h-24"/>
        {sourceImages.length > 1 && <div className="mt-1 flex gap-1 overflow-x-auto pb-1">{sourceImages.slice(1).map((image, index) => <img key={image} src={optimizedImageUrl(image, 96)} alt={`${tour.hotel}, фото ${index + 2}`} loading="lazy" onError={showTourImageFallback} className="h-8 w-8 shrink-0 rounded object-cover"/>)}</div>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate font-black text-navy">{tour.hotel}</h2>
          {tour.isHot && <Flame className="size-4 shrink-0 fill-brand text-brand"/>}
          {tour.isHidden && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500">Скрыт</span>}
        </div>
        <p className="mt-1 text-sm text-slate-500">{tour.country}, {tour.resort} · {tour.nights} ночей</p>
        {tour.partnerSource && <p className="mt-1 truncate text-[11px] text-slate-400" title={tour.externalOfferId}>
          <span className="font-black uppercase text-slate-600">{tour.partnerSource}</span> · ID {tour.externalOfferId || 'не указан'}{syncedAt ? ` · ${syncedAt}` : ''}
        </p>}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-700"><Images className="size-3"/>{sourceImages.length} фото</span>
          {sourceImages.length < 3 && <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-700"><TriangleAlert className="size-3"/>Мало фото</span>}
          {hasFallback && <span className="rounded-full bg-red-50 px-2 py-1 text-red-600">Резерв</span>}
        </div>
        <p className="mt-2 font-black text-brand-dark">{formatPrice(tour.price)}</p>
      </div>
      <div className="flex flex-wrap gap-2 sm:w-48 sm:justify-end">
        <button onClick={() => onEdit(tour)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-mist px-3 py-2.5 text-xs font-extrabold text-brand-dark hover:bg-brand/15"><Edit3 className="size-4"/>Изменить</button>
        <button onClick={() => onToggleHidden(tour)} className={`grid size-11 shrink-0 place-items-center rounded-xl ${tour.isHidden ? 'bg-brand/10 text-brand-dark hover:bg-brand/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`} aria-label={`${tour.isHidden ? 'Показать' : 'Скрыть'} ${tour.hotel}`}>{tour.isHidden ? <Eye className="size-4"/> : <EyeOff className="size-4"/>}</button>
        <button onClick={() => onRemove(tour)} className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100" aria-label={`Удалить ${tour.hotel}`}><Trash2 className="size-4"/></button>
      </div>
    </article>;
  })}</div>;
}
