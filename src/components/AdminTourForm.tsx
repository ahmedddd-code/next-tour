import { ArrowLeft, ArrowRight, Eye, ImagePlus, Save, X } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Tour } from '../data/tours';
import { resizeImage, showTourImageFallback } from '../utils/image';
import { NumberInput } from './NumberInput';

type Props = { initialTour: Tour | null; onSave: (tour: Tour) => void; onCancel: () => void };
const emptyTour: Tour = { id: '', hotel: '', country: '', resort: '', departureCity: 'Алматы', dates: '', nights: 7, meal: 'Завтраки', price: 1500000, rating: 4.5, reviews: 0, popularity: 50, isHot: false, images: [], description: '', included: ['Перелёт туда и обратно', 'Проживание в отеле', 'Медицинская страховка'] };

export function AdminTourForm({ initialTour, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<Tour>(initialTour ?? emptyTour);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
  function moveImage(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= draft.images.length) return;
    const images = [...draft.images];
    [images[index], images[target]] = [images[target], images[index]];
    setDraft(current => ({ ...current, images, coverImage: images[0] }));
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.images.length) { setImageError('Добавьте хотя бы одно изображение.'); return; }
    const included = draft.included.map(item => item.trim()).filter(Boolean);
    onSave({ ...draft, included, coverImage: draft.images[0], id: draft.id || `tour-${crypto.randomUUID()}` });
  }

  return <form onSubmit={submit} className="mx-auto my-2 w-full max-w-[560px] rounded-3xl bg-white p-5 shadow-[0_16px_50px_rgba(7,29,52,.1)] sm:p-7 lg:sticky lg:top-4 lg:my-0">
    <div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-brand-dark">Редактор</p><h2 className="mt-1 text-2xl font-black">{initialTour ? 'Изменить тур' : 'Новый тур'}</h2></div><button type="button" onClick={onCancel} className="grid size-10 place-items-center rounded-full bg-mist text-slate-500 hover:text-navy" aria-label="Закрыть"><X className="size-5"/></button></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-500">Название отеля</span><input required value={draft.hotel} onChange={e => update('hotel', e.target.value)} className={inputClass}/></label>
      {[['Страна','country'],['Курорт','resort'],['Город','city'],['Город вылета','departureCity'],['Авиакомпания','airline'],['Даты тура','dates']].map(([label, key]) => <label key={key}><span className="mb-1.5 block text-xs font-bold text-slate-500">{label}</span><input required={!['city', 'airline'].includes(key)} value={String(draft[key as keyof Tour] ?? '')} onChange={e => update(key as keyof Tour, e.target.value as never)} className={inputClass}/></label>)}
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Ночей</span><NumberInput required min="1" value={draft.nights} onNumberChange={value => update('nights', value)} className={inputClass}/></label>
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Питание</span><input required value={draft.meal} onChange={e => update('meal', e.target.value)} className={inputClass}/></label>
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Цена, ₸</span><NumberInput required min="1" value={draft.price} onNumberChange={value => update('price', value)} className={inputClass}/></label>
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Старая цена, ₸</span><NumberInput min="0" value={draft.oldPrice} onNumberChange={value => update('oldPrice', value)} onClear={() => update('oldPrice', undefined)} className={inputClass}/></label>
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Рейтинг</span><NumberInput required min="1" max="5" step="0.1" value={draft.rating} onNumberChange={value => update('rating', value)} className={inputClass}/></label>
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Количество отзывов</span><NumberInput required min="0" value={draft.reviews} onNumberChange={value => update('reviews', value)} className={inputClass}/></label>
      <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Популярность, 0–100</span><NumberInput required min="0" max="100" value={draft.popularity} onNumberChange={value => update('popularity', value)} className={inputClass}/></label>
      <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-500">Описание</span><textarea required rows={4} value={draft.description} onChange={e => update('description', e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"/></label>
      <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-500">Что входит в тур — каждый пункт с новой строки</span><textarea required rows={5} value={draft.included.join('\n')} onChange={e => update('included', e.target.value.split('\n'))} placeholder={'Перелёт туда и обратно\nПроживание в отеле\nМедицинская страховка'} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"/></label>
    </div>
    <div className="mt-5"><p className="mb-2 text-xs font-bold text-slate-500">Фотографии</p><div className="flex gap-2"><input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Ссылка на изображение" className={inputClass}/><button type="button" onClick={addUrl} className="shrink-0 rounded-xl bg-mist px-4 text-sm font-black text-brand-dark">Добавить</button></div><label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-brand/40 px-4 py-3 text-sm font-extrabold text-brand-dark transition hover:bg-brand/5"><ImagePlus className="size-4"/>Загрузить с устройства<input type="file" accept="image/*" onChange={upload} className="hidden"/></label>{imageError && <p className="mt-2 text-xs font-bold text-red-500">{imageError}</p>}
      <p className="mt-3 text-xs text-slate-400">Первое фото используется как обложка. Меняйте порядок стрелками.</p><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{draft.images.map((image, index) => <div key={`${image.slice(0, 30)}-${index}`} className="group relative overflow-hidden rounded-xl border border-slate-100 bg-mist"><button type="button" onClick={() => setPreviewImage(image)} className="relative block h-28 w-full"><img src={image} alt={`Фото ${index + 1}`} onError={showTourImageFallback} className="size-full object-cover"/>{index === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-brand px-2 py-1 text-[9px] font-black text-white">Обложка</span>}<Eye className="absolute bottom-2 right-2 size-4 text-white drop-shadow"/></button><div className="grid grid-cols-3 gap-1 p-1"><button type="button" disabled={index === 0} onClick={() => moveImage(index, -1)} className="grid h-8 place-items-center rounded-lg bg-white disabled:opacity-30"><ArrowLeft className="size-3"/></button><button type="button" disabled={index === draft.images.length - 1} onClick={() => moveImage(index, 1)} className="grid h-8 place-items-center rounded-lg bg-white disabled:opacity-30"><ArrowRight className="size-3"/></button><button type="button" onClick={() => update('images', draft.images.filter((_, imageIndex) => imageIndex !== index))} className="grid h-8 place-items-center rounded-lg bg-red-50 text-red-500"><X className="size-3"/></button></div></div>)}</div>
    </div>
    {previewImage && <div className="fixed inset-0 z-[90] grid place-items-center bg-navy/90 p-4" onClick={() => setPreviewImage(null)}><button type="button" onClick={() => setPreviewImage(null)} className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white text-navy" aria-label="Закрыть просмотр"><X/></button><img src={previewImage} alt="Крупный просмотр фотографии тура" className="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain"/></div>}
    <label className="mt-5 flex cursor-pointer items-center justify-between rounded-2xl bg-mist p-4"><span><strong className="block text-sm">🔥 Горящий тур</strong><span className="text-xs text-slate-500">Показывать специальный бейдж</span></span><input type="checkbox" checked={draft.isHot} onChange={e => update('isHot', e.target.checked)} className="size-5 accent-brand"/></label>
    <button className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand font-extrabold text-white transition hover:bg-brand-dark"><Save className="size-4"/>Сохранить тур</button>
  </form>;
}
