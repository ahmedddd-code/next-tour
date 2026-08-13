import { ImagePlus, Save, X } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Tour } from '../data/tours';
import { resizeImage } from '../utils/image';

type Props = { initialTour: Tour | null; onSave: (tour: Tour) => void; onCancel: () => void };
const emptyTour: Tour = { id: '', hotel: '', country: '', resort: '', departureCity: 'Алматы', dates: '', nights: 7, meal: 'Завтраки', price: 1500000, rating: 4.5, reviews: 0, popularity: 50, isHot: false, images: [], description: '', included: ['Перелёт туда и обратно', 'Проживание в отеле', 'Медицинская страховка'] };

export function AdminTourForm({ initialTour, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<Tour>(initialTour ?? emptyTour);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  useEffect(() => { setDraft(initialTour ?? emptyTour); setImageUrl(''); setImageError(''); }, [initialTour]);
  const update = <K extends keyof Tour>(key: K, value: Tour[K]) => setDraft(current => ({ ...current, [key]: value }));
  const inputClass = 'h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10';

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try { const image = await resizeImage(file); update('images', [...draft.images, image]); setImageError(''); }
    catch { setImageError('Не удалось загрузить изображение.'); }
    event.target.value = '';
  }
  function addUrl() { if (imageUrl.trim()) { update('images', [...draft.images, imageUrl.trim()]); setImageUrl(''); } }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.images.length) { setImageError('Добавьте хотя бы одно изображение.'); return; }
    const included = draft.included.map(item => item.trim()).filter(Boolean);
    onSave({ ...draft, included, id: draft.id || `tour-${crypto.randomUUID()}` });
  }

  return <form onSubmit={submit} className="mx-auto my-2 w-full max-w-[560px] rounded-3xl bg-white p-5 shadow-[0_16px_50px_rgba(7,29,52,.1)] sm:p-7 lg:sticky lg:top-4 lg:my-0">
    <div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-brand-dark">Редактор</p><h2 className="mt-1 text-2xl font-black">{initialTour ? 'Изменить тур' : 'Новый тур'}</h2></div><button type="button" onClick={onCancel} className="grid size-10 place-items-center rounded-full bg-mist text-slate-500 hover:text-navy" aria-label="Закрыть"><X className="size-5"/></button></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-500">Название отеля</span><input required value={draft.hotel} onChange={e => update('hotel', e.target.value)} className={inputClass}/></label>
      {[['Страна','country'],['Курорт','resort'],['Город','city'],['Город вылета','departureCity'],['Авиакомпания','airline'],['Даты тура','dates']].map(([label, key]) => <label key={key}><span className="mb-1.5 block text-xs font-bold text-slate-500">{label}</span><input required={!['city', 'airline'].includes(key)} value={String(draft[key as keyof Tour] ?? '')} onChange={e => update(key as keyof Tour, e.target.value as never)} className={inputClass}/></label>)}
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Ночей</span><input required min="1" type="number" value={draft.nights} onChange={e => update('nights', Number(e.target.value))} className={inputClass}/></label>
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Питание</span><input required value={draft.meal} onChange={e => update('meal', e.target.value)} className={inputClass}/></label>
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Цена, ₸</span><input required min="1" type="number" value={draft.price} onChange={e => update('price', Number(e.target.value))} className={inputClass}/></label>
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Старая цена, ₸</span><input min="0" type="number" value={draft.oldPrice ?? ''} onChange={e => update('oldPrice', e.target.value ? Number(e.target.value) : undefined)} className={inputClass}/></label>
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Рейтинг</span><input required min="1" max="5" step="0.1" type="number" value={draft.rating} onChange={e => update('rating', Number(e.target.value))} className={inputClass}/></label>
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Количество отзывов</span><input required min="0" type="number" value={draft.reviews} onChange={e => update('reviews', Number(e.target.value))} className={inputClass}/></label>
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Популярность, 0–100</span><input required min="0" max="100" type="number" value={draft.popularity} onChange={e => update('popularity', Number(e.target.value))} className={inputClass}/></label>
      <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-500">Описание</span><textarea required rows={4} value={draft.description} onChange={e => update('description', e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"/></label>
      <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-500">Что входит в тур — каждый пункт с новой строки</span><textarea required rows={5} value={draft.included.join('\n')} onChange={e => update('included', e.target.value.split('\n'))} placeholder={'Перелёт туда и обратно\nПроживание в отеле\nМедицинская страховка'} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"/></label>
    </div>
    <div className="mt-5"><p className="mb-2 text-xs font-bold text-slate-500">Фотографии</p><div className="flex gap-2"><input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Ссылка на изображение" className={inputClass}/><button type="button" onClick={addUrl} className="shrink-0 rounded-xl bg-mist px-4 text-sm font-black text-brand-dark">Добавить</button></div><label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-brand/40 px-4 py-3 text-sm font-extrabold text-brand-dark transition hover:bg-brand/5"><ImagePlus className="size-4"/>Загрузить с устройства<input type="file" accept="image/*" onChange={upload} className="hidden"/></label>{imageError && <p className="mt-2 text-xs font-bold text-red-500">{imageError}</p>}
      <div className="mt-3 flex flex-wrap gap-2">{draft.images.map((image, index) => <div key={`${image.slice(0, 30)}-${index}`} className="group relative size-20 overflow-hidden rounded-xl"><img src={image} alt="" className="size-full object-cover"/><button type="button" onClick={() => update('images', draft.images.filter((_, imageIndex) => imageIndex !== index))} className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-navy/80 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"><X className="size-3"/></button></div>)}</div>
    </div>
    <label className="mt-5 flex cursor-pointer items-center justify-between rounded-2xl bg-mist p-4"><span><strong className="block text-sm">🔥 Горящий тур</strong><span className="text-xs text-slate-500">Показывать специальный бейдж</span></span><input type="checkbox" checked={draft.isHot} onChange={e => update('isHot', e.target.checked)} className="size-5 accent-brand"/></label>
    <button className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand font-extrabold text-white transition hover:bg-brand-dark"><Save className="size-4"/>Сохранить тур</button>
  </form>;
}
