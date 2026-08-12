import { CheckCircle2, Send, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import type { Tour } from '../data/tours';
import { formatPrice } from '../data/tours';
import { useBookings } from '../hooks/useBookings';

type Props = { tour: Tour; onClose: () => void };

function formatPhone(phoneDigits: string) {
  const digits = phoneDigits.replace(/\D/g, '').slice(0, 10);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)];
  let formatted = '+7';
  if (parts[0]) formatted += ` (${parts[0]}`;
  if (parts[0].length === 3) formatted += ')';
  if (parts[1]) formatted += ` ${parts[1]}`;
  if (parts[2]) formatted += `-${parts[2]}`;
  if (parts[3]) formatted += `-${parts[3]}`;
  return formatted;
}

function extractPhoneDigits(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('7')) digits = digits.slice(1);
  else if (digits.length > 10 && digits.startsWith('8')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export function BookingModal({ tour, onClose }: Props) {
  const { addBooking } = useBookings();
  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [email, setEmail] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [comment, setComment] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [sent, setSent] = useState(false);
  const inputClass = 'h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-navy outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10';

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', closeOnEscape); };
  }, [onClose]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (phoneDigits.length !== 10) { setPhoneError('Введите 10 цифр номера телефона.'); return; }
    addBooking({
      tourId: tour.id,
      tourHotel: tour.hotel,
      tourDestination: `${tour.country}, ${tour.resort}`,
      tourPrice: tour.price,
      name: name.trim(),
      phone: formatPhone(phoneDigits),
      email: email.trim(),
      tripDate,
      adults,
      children,
      comment: comment.trim(),
    });
    setSent(true);
  }

  return <div onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-navy/70 p-3 backdrop-blur-sm sm:p-6">
    <div role="dialog" aria-modal="true" aria-labelledby="booking-title" className="my-auto w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-7">
        <div className="min-w-0"><p className="text-xs font-black uppercase tracking-wider text-brand-dark">Бронирование тура</p><h2 id="booking-title" className="mt-1 truncate text-2xl font-black text-navy">{tour.hotel}</h2><p className="mt-1 text-sm text-slate-500">{tour.country}, {tour.resort} · {formatPrice(tour.price)}</p></div>
        <button onClick={onClose} className="ml-3 grid size-10 shrink-0 place-items-center rounded-full bg-mist text-slate-500 transition hover:text-navy" aria-label="Закрыть"><X className="size-5"/></button>
      </div>

      {sent ? <div className="px-6 py-14 text-center sm:px-10">
        <CheckCircle2 className="mx-auto size-16 text-brand"/><h3 className="mt-5 text-2xl font-black text-navy">Заявка успешно отправлена</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Заявка сохранена. Менеджер свяжется с вами по номеру {formatPhone(phoneDigits)}.</p><button onClick={onClose} className="mt-7 rounded-2xl bg-brand px-8 py-3.5 font-extrabold text-white transition hover:bg-brand-dark">Готово</button>
      </div> : <form onSubmit={submit} className="p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Имя *</span><input autoFocus required value={name} onChange={event => setName(event.target.value)} placeholder="Ваше имя" className={inputClass}/></label>
          <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Телефон *</span><input required type="tel" inputMode="numeric" value={formatPhone(phoneDigits)} onChange={event => { setPhoneDigits(extractPhoneDigits(event.target.value)); setPhoneError(''); }} className={inputClass}/>{phoneError && <span className="mt-1 block text-xs font-bold text-red-500">{phoneError}</span>}</label>
          <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Email</span><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" className={inputClass}/></label>
          <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Дата поездки</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={tripDate} onChange={event => setTripDate(event.target.value)} className={inputClass}/></label>
          <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Взрослые</span><input required type="number" min="1" max="20" value={adults} onChange={event => setAdults(Number(event.target.value))} className={inputClass}/></label>
          <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Дети</span><input required type="number" min="0" max="20" value={children} onChange={event => setChildren(Number(event.target.value))} className={inputClass}/></label>
          <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-500">Комментарий</span><textarea rows={3} value={comment} onChange={event => setComment(event.target.value)} placeholder="Дополнительные пожелания" className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm font-semibold text-navy outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"/></label>
        </div>
        <button className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand font-extrabold text-white transition hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/20"><Send className="size-4"/>Отправить заявку</button>
        <p className="mt-3 text-center text-[11px] leading-4 text-slate-400">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</p>
      </form>}
    </div>
  </div>;
}
