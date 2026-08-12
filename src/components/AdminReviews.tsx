import { Check, Star, Trash2 } from 'lucide-react';
import { useReviews } from '../hooks/useReviews';

export function AdminReviews() {
  const { reviews, publishReview, deleteReview } = useReviews();
  const pending = reviews.filter(review => review.status === 'pending').length;
  return <section><div className="mb-6"><p className="text-xs font-black uppercase tracking-[.18em] text-brand-dark">Отзывы Next Tour</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">Модерация отзывов</h1><p className="mt-2 text-sm text-slate-500">Всего: {reviews.length} · На проверке: {pending}</p></div>
    <div className="space-y-4">{reviews.map(review => <article key={review.id} className="rounded-3xl bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><div className="flex items-center gap-2"><strong className="text-navy">{review.name}</strong><span className={`rounded-full px-2 py-1 text-[10px] font-black ${review.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-brand/10 text-brand-dark'}`}>{review.status === 'pending' ? 'На проверке' : 'Опубликован'}</span></div><div className="mt-2 flex text-amber-400">{Array.from({ length: review.rating }, (_, index) => <Star key={index} className="size-4 fill-current"/>)}</div><p className="mt-3 leading-6 text-slate-600">«{review.text}»</p></div><div className="flex shrink-0 gap-2">{review.status === 'pending' && <button onClick={() => publishReview(review.id)} className="flex items-center gap-2 rounded-xl bg-brand/10 px-3 py-2 text-xs font-black text-brand-dark"><Check className="size-4"/>Опубликовать</button>}<button onClick={() => deleteReview(review.id)} className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-500" aria-label="Удалить отзыв"><Trash2 className="size-4"/></button></div></div></article>)}</div>
    {reviews.length === 0 && <div className="rounded-3xl bg-white py-20 text-center font-black text-navy">Отзывов пока нет</div>}
  </section>;
}
