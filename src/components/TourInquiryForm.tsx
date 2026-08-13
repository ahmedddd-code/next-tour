import { CalendarCheck2, Phone } from 'lucide-react';
import { useState } from 'react';
import type { Tour } from '../data/tours';
import { BookingModal } from './BookingModal';
import { useAuth } from '../hooks/useAuth';

export function TourInquiryForm({ tour }: { tour: Tour }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { requestAuth } = useAuth();
  return <><aside className="rounded-3xl bg-white p-6 shadow-[0_18px_60px_rgba(7,29,52,.12)] lg:sticky lg:top-6">
    <p className="text-sm font-bold text-slate-400">Оставьте заявку</p><h2 className="mt-1 text-2xl font-black tracking-tight">Забронировать тур</h2><p className="mt-2 text-sm leading-6 text-slate-500">Менеджер проверит актуальную цену и свяжется с вами в течение 15 минут.</p>
    <div className="mt-6 rounded-2xl bg-mist p-4"><p className="flex items-center gap-2 text-sm font-bold text-navy"><CalendarCheck2 className="size-5 text-brand"/>Все детали — в одной короткой форме</p></div>
    <button onClick={() => requestAuth(() => setModalOpen(true))} className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand font-extrabold text-white transition hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/20"><Phone className="size-4"/>Забронировать</button>
  </aside>{modalOpen && <BookingModal tour={tour} onClose={() => setModalOpen(false)}/>}</>;
}
