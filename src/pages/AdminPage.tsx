import { ClipboardList, Edit3, ExternalLink, Flame, LogOut, Map, MessageCircle, MessageSquareText, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { AdminTourForm } from '../components/AdminTourForm';
import { AdminBookings } from '../components/AdminBookings';
import { AdminReviews } from '../components/AdminReviews';
import { AdminSupportChats } from '../components/AdminSupportChats';
import { AdminLogin } from '../components/AdminLogin';
import { Logo } from '../components/Logo';
import { formatPrice, type Tour } from '../data/tours';
import { useTours } from '../hooks/useTours';
import { useBookings } from '../hooks/useBookings';
import { useReviews } from '../hooks/useReviews';
import { useSupportChat } from '../hooks/useSupportChat';

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('nexttour:admin-authenticated') === 'true');
  const { tours, addTour, updateTour, deleteTour, resetTours } = useTours();
  const { bookings } = useBookings();
  const { reviews } = useReviews();
  const { conversations } = useSupportChat();
  const [activeTab, setActiveTab] = useState<'tours' | 'bookings' | 'reviews' | 'chats'>('tours');
  const [editing, setEditing] = useState<Tour | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  async function save(tour: Tour) { if (editing) await updateTour(tour); else await addTour(tour); setEditing(null); setFormOpen(false); }
  function edit(tour: Tour) { setEditing(tour); setFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function remove(tour: Tour) { if (window.confirm(`Удалить тур «${tour.hotel}»?`)) { deleteTour(tour.id); if (editing?.id === tour.id) { setEditing(null); setFormOpen(false); } } }

  if (!authenticated) return <AdminLogin onSuccess={() => setAuthenticated(true)}/>;

  return <main className="min-h-screen bg-[#f4f8f5]">
    <Helmet><title>Управление турами — NEXT TOUR</title><meta name="robots" content="noindex,nofollow"/></Helmet>
    <header className="border-b border-slate-200 bg-white"><div className="section-shell flex h-20 items-center justify-between"><Logo/><div className="flex items-center gap-2"><Link to="/tours" className="hidden items-center gap-2 rounded-xl bg-mist px-4 py-2.5 text-sm font-extrabold text-navy transition hover:bg-brand/10 sm:flex"><ExternalLink className="size-4"/>Открыть каталог</Link>{activeTab === 'tours' && <button onClick={() => { setEditing(null); setFormOpen(true); }} className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-dark"><Plus className="size-4"/>Добавить тур</button>}<button onClick={() => { sessionStorage.removeItem('nexttour:admin-authenticated'); setAuthenticated(false); }} className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100" aria-label="Выйти из админ-панели"><LogOut className="size-4"/></button></div></div></header>
    <nav className="border-b border-slate-200 bg-white"><div className="section-shell flex flex-wrap gap-2 py-3"><button onClick={() => setActiveTab('tours')} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${activeTab === 'tours' ? 'bg-brand text-white' : 'text-slate-500 hover:bg-mist'}`}><Map className="size-4"/>Туры Next Tour</button><button onClick={() => { setActiveTab('bookings'); setFormOpen(false); }} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${activeTab === 'bookings' ? 'bg-brand text-white' : 'text-slate-500 hover:bg-mist'}`}><ClipboardList className="size-4"/>Заявки{bookings.some(booking => booking.status === 'new') && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{bookings.filter(booking => booking.status === 'new').length}</span>}</button><button onClick={() => { setActiveTab('chats'); setFormOpen(false); }} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${activeTab === 'chats' ? 'bg-brand text-white' : 'text-slate-500 hover:bg-mist'}`}><MessageCircle className="size-4"/>Чаты{conversations.some(conversation => conversation.status === 'open') && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{conversations.filter(conversation => conversation.status === 'open').length}</span>}</button><button onClick={() => { setActiveTab('reviews'); setFormOpen(false); }} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${activeTab === 'reviews' ? 'bg-brand text-white' : 'text-slate-500 hover:bg-mist'}`}><MessageSquareText className="size-4"/>Отзывы{reviews.some(review => review.status === 'pending') && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{reviews.filter(review => review.status === 'pending').length}</span>}</button></div></nav>
    {activeTab === 'tours' ? <div className={`section-shell grid gap-7 py-10 ${formOpen ? 'lg:grid-cols-[minmax(0,1fr)_460px]' : ''}`}>
      <section><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-brand-dark">Админ-панель</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">Управление турами</h1><p className="mt-2 text-sm text-slate-500">В каталоге: {tours.length}</p></div><button onClick={() => { if (window.confirm('Вернуть исходный каталог? Все изменения будут потеряны.')) resetTours(); }} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-navy"><RotateCcw className="size-4"/>Восстановить исходные</button></div>
        <div className="space-y-3">{tours.map(tour => <article key={tour.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center"><img src={tour.images[0]} alt={tour.hotel} className="h-28 w-full rounded-xl object-cover sm:h-20 sm:w-28"/><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate font-black text-navy">{tour.hotel}</h2>{tour.isHot && <Flame className="size-4 shrink-0 fill-brand text-brand"/>}</div><p className="mt-1 text-sm text-slate-500">{tour.country}, {tour.resort} · {tour.nights} ночей</p><p className="mt-1 font-black text-brand-dark">{formatPrice(tour.price)}</p></div><div className="flex gap-2"><button onClick={() => edit(tour)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-mist px-4 py-3 text-sm font-extrabold text-brand-dark hover:bg-brand/15"><Edit3 className="size-4"/>Изменить</button><button onClick={() => remove(tour)} className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100" aria-label={`Удалить ${tour.hotel}`}><Trash2 className="size-4"/></button></div></article>)}</div>
        {tours.length === 0 && <div className="rounded-3xl bg-white py-20 text-center"><p className="font-black">Каталог пуст</p><button onClick={() => setFormOpen(true)} className="mt-3 text-sm font-bold text-brand-dark">Добавить первый тур</button></div>}
      </section>
      {formOpen && <div><AdminTourForm initialTour={editing} onSave={save} onCancel={() => { setFormOpen(false); setEditing(null); }}/></div>}
    </div> : <div className="section-shell py-10">{activeTab === 'reviews' ? <AdminReviews/> : activeTab === 'chats' ? <AdminSupportChats/> : <AdminBookings/>}</div>}
  </main>;
}
