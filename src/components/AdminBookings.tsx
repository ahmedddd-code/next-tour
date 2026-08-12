import { Check, Clock3, Mail, Phone, Trash2, Users } from 'lucide-react';
import { formatPrice } from '../data/tours';
import { useBookings } from '../hooks/useBookings';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function AdminBookings() {
  const { bookings, toggleBookingStatus, deleteBooking } = useBookings();
  const newCount = bookings.filter(booking => booking.status === 'new').length;

  return <section>
    <div className="mb-6"><p className="text-xs font-black uppercase tracking-[.18em] text-brand-dark">Админ-панель</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">Заявки</h1><p className="mt-2 text-sm text-slate-500">Всего: {bookings.length} · Новых: {newCount}</p></div>
    {bookings.length === 0 ? <div className="rounded-3xl bg-white px-6 py-20 text-center shadow-sm"><Clock3 className="mx-auto size-12 text-slate-300"/><p className="mt-4 text-lg font-black text-navy">Заявок пока нет</p><p className="mt-1 text-sm text-slate-500">Новые заявки появятся здесь сразу после отправки формы.</p></div> : <div className="space-y-4">
      {bookings.map(booking => <article key={booking.id} className={`rounded-3xl border bg-white p-5 shadow-sm sm:p-6 ${booking.status === 'new' ? 'border-brand/30' : 'border-slate-100 opacity-75'}`}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${booking.status === 'new' ? 'bg-brand/10 text-brand-dark' : 'bg-slate-100 text-slate-500'}`}>{booking.status === 'new' ? 'Новая' : 'Обработана'}</span><span className="text-xs font-semibold text-slate-400">{formatDate(booking.createdAt)}</span></div><h2 className="mt-3 text-xl font-black text-navy">{booking.name}</h2><p className="mt-1 font-bold text-slate-600">{booking.tourHotel}</p><p className="text-sm text-slate-500">{booking.tourDestination} · {formatPrice(booking.tourPrice)}</p></div>
          <div className="flex gap-2"><button onClick={() => toggleBookingStatus(booking.id)} className="flex items-center gap-2 rounded-xl bg-mist px-3 py-2.5 text-xs font-extrabold text-brand-dark transition hover:bg-brand/15"><Check className="size-4"/>{booking.status === 'new' ? 'Обработать' : 'Вернуть'}</button><button onClick={() => { if (window.confirm(`Удалить заявку от ${booking.name}?`)) deleteBooking(booking.id); }} className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100" aria-label="Удалить заявку"><Trash2 className="size-4"/></button></div>
        </div>
        <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <a href={`tel:${booking.phone.replace(/\D/g, '')}`} className="flex items-center gap-2 font-bold text-navy hover:text-brand-dark"><Phone className="size-4 text-brand"/>{booking.phone}</a>
          <span className="flex items-center gap-2 text-slate-600"><Mail className="size-4 text-brand"/>{booking.email || 'Email не указан'}</span>
          <span className="flex items-center gap-2 text-slate-600"><Clock3 className="size-4 text-brand"/>{booking.tripDate ? new Date(`${booking.tripDate}T00:00:00`).toLocaleDateString('ru-RU') : 'Дата не указана'}</span>
          <span className="flex items-center gap-2 text-slate-600"><Users className="size-4 text-brand"/>{booking.adults} взр. · {booking.children} дет.</span>
        </div>
        {booking.comment && <p className="mt-4 rounded-2xl border border-slate-100 p-4 text-sm leading-6 text-slate-600"><strong className="text-navy">Комментарий:</strong> {booking.comment}</p>}
      </article>)}
    </div>}
  </section>;
}
