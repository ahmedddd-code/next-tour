import { ClipboardList, Edit3, ExternalLink, Flame, Home, LogOut, Map, Menu, MessageCircle, MessageSquareText, Plus, RotateCcw, Settings, Trash2, X } from 'lucide-react';
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
import { BookingsProvider } from '../hooks/useBookings';
import { ReviewsProvider } from '../hooks/useReviews';
import { SupportChatProvider } from '../hooks/useSupportChat';

export function AdminPage() {
  return <BookingsProvider><ReviewsProvider><SupportChatProvider><AdminContent/></SupportChatProvider></ReviewsProvider></BookingsProvider>;
}

function AdminContent() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('nexttour:admin-authenticated') === 'true');
  const { allTours: tours, addTour, updateTour, deleteTour, resetTours } = useTours();
  const [activeTab, setActiveTab] = useState<'tours' | 'bookings' | 'reviews' | 'chats' | 'settings'>('tours');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editing, setEditing] = useState<Tour | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  async function save(tour: Tour) { if (editing) await updateTour(tour); else await addTour(tour); setEditing(null); setFormOpen(false); }
  function edit(tour: Tour) { setEditing(tour); setFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function remove(tour: Tour) { if (window.confirm(`Удалить тур «${tour.hotel}»?`)) { deleteTour(tour.id); if (editing?.id === tour.id) { setEditing(null); setFormOpen(false); } } }

  if (!authenticated) return <AdminLogin onSuccess={() => setAuthenticated(true)}/>;

  const selectTab = (tab: typeof activeTab) => { setActiveTab(tab); setFormOpen(false); setMobileMenuOpen(false); };

  return <main className="min-h-screen overflow-x-hidden bg-[#f4f8f5] pb-24 md:pb-0">
    <Helmet><title>Управление турами — NEXT TOUR</title><meta name="robots" content="noindex,nofollow"/></Helmet>
    <header className="border-b border-slate-200 bg-white"><div className="section-shell flex h-20 items-center justify-between"><Logo/><div className="hidden items-center gap-2 md:flex"><Link to="/tours" className="flex items-center gap-2 rounded-xl bg-mist px-4 py-2.5 text-sm font-extrabold text-navy transition hover:bg-brand/10"><ExternalLink className="size-4"/>Открыть каталог</Link>{activeTab === 'tours' && <button onClick={() => { setEditing(null); setFormOpen(true); }} className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-dark"><Plus className="size-4"/>Добавить тур</button>}<button onClick={() => { sessionStorage.removeItem('nexttour:admin-authenticated'); setAuthenticated(false); }} className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100" aria-label="Выйти из админ-панели"><LogOut className="size-4"/></button></div><div className="flex items-center gap-2 md:hidden">{activeTab === 'tours' && <button onClick={() => { setEditing(null); setFormOpen(true); }} className="grid size-11 place-items-center rounded-xl bg-brand text-white" aria-label="Добавить тур"><Plus className="size-5"/></button>}<button onClick={() => setMobileMenuOpen(value => !value)} className="grid size-11 place-items-center rounded-xl bg-navy text-white" aria-label="Меню админ-панели">{mobileMenuOpen ? <X/> : <Menu/>}</button></div></div>{mobileMenuOpen && <div className="border-t border-slate-100 p-3 md:hidden"><div className="section-shell grid gap-2"><Link to="/" className="rounded-xl bg-mist px-4 py-3 text-sm font-black">Открыть главную</Link><button onClick={() => selectTab('reviews')} className="flex items-center gap-2 rounded-xl bg-mist px-4 py-3 text-left text-sm font-black"><MessageSquareText className="size-4 text-brand-dark"/>Отзывы</button><button onClick={() => { sessionStorage.removeItem('nexttour:admin-authenticated'); setAuthenticated(false); }} className="rounded-xl bg-red-50 px-4 py-3 text-left text-sm font-black text-red-600">Выйти из админки</button></div></div>}</header>
    <nav className="hidden border-b border-slate-200 bg-white md:block"><div className="section-shell flex flex-wrap gap-2 py-3"><button onClick={() => selectTab('tours')} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${activeTab === 'tours' ? 'bg-brand text-white' : 'text-slate-500 hover:bg-mist'}`}><Map className="size-4"/>Туры Next Tour</button><button onClick={() => selectTab('bookings')} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${activeTab === 'bookings' ? 'bg-brand text-white' : 'text-slate-500 hover:bg-mist'}`}><ClipboardList className="size-4"/>Заявки</button><button onClick={() => selectTab('chats')} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${activeTab === 'chats' ? 'bg-brand text-white' : 'text-slate-500 hover:bg-mist'}`}><MessageCircle className="size-4"/>Чаты</button><button onClick={() => selectTab('reviews')} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${activeTab === 'reviews' ? 'bg-brand text-white' : 'text-slate-500 hover:bg-mist'}`}><MessageSquareText className="size-4"/>Отзывы</button></div></nav>
    {activeTab === 'tours' ? <div className={`section-shell grid gap-7 py-10 ${formOpen ? 'lg:grid-cols-[minmax(0,1fr)_460px]' : ''}`}>
      <section><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-brand-dark">Админ-панель</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">Управление турами</h1><p className="mt-2 text-sm text-slate-500">В каталоге: {tours.length}</p></div><button onClick={() => { if (window.confirm('Вернуть исходный каталог? Все изменения будут потеряны.')) resetTours(); }} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-navy"><RotateCcw className="size-4"/>Восстановить исходные</button></div>
        <div className="space-y-3">{tours.map(tour => <article key={tour.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center"><img src={tour.images[0]} alt={tour.hotel} className="h-28 w-full rounded-xl object-cover sm:h-20 sm:w-28"/><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate font-black text-navy">{tour.hotel}</h2>{tour.isHot && <Flame className="size-4 shrink-0 fill-brand text-brand"/>}</div><p className="mt-1 text-sm text-slate-500">{tour.country}, {tour.resort} · {tour.nights} ночей</p><p className="mt-1 font-black text-brand-dark">{formatPrice(tour.price)}</p></div><div className="flex gap-2"><button onClick={() => edit(tour)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-mist px-4 py-3 text-sm font-extrabold text-brand-dark hover:bg-brand/15"><Edit3 className="size-4"/>Изменить</button><button onClick={() => remove(tour)} className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100" aria-label={`Удалить ${tour.hotel}`}><Trash2 className="size-4"/></button></div></article>)}</div>
        {tours.length === 0 && <div className="rounded-3xl bg-white py-20 text-center"><p className="font-black">Каталог пуст</p><button onClick={() => setFormOpen(true)} className="mt-3 text-sm font-bold text-brand-dark">Добавить первый тур</button></div>}
      </section>
      {formOpen && <div className="fixed inset-0 z-[60] overflow-y-auto bg-navy/60 p-3 backdrop-blur-sm lg:static lg:z-auto lg:overflow-visible lg:bg-transparent lg:p-0 lg:backdrop-blur-none"><AdminTourForm initialTour={editing} onSave={save} onCancel={() => { setFormOpen(false); setEditing(null); }}/></div>}
    </div> : <div className="section-shell py-8 sm:py-10">{activeTab === 'reviews' ? <AdminReviews/> : activeTab === 'chats' ? <AdminSupportChats/> : activeTab === 'settings' ? <section className="rounded-3xl bg-white p-6 shadow-sm"><Settings className="size-10 text-brand"/><h1 className="mt-4 text-3xl font-black">Настройки</h1><p className="mt-2 text-sm text-slate-500">Управление текущей сессией администратора.</p><button onClick={() => { sessionStorage.removeItem('nexttour:admin-authenticated'); setAuthenticated(false); }} className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-sm font-black text-red-600"><LogOut className="size-4"/>Выйти из админки</button></section> : <AdminBookings/>}</div>}
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(7,29,52,.1)] backdrop-blur-xl md:hidden">
      <Link to="/" className="flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-black text-slate-500"><Home className="size-5"/>Главная</Link>
      {[{ id: 'tours' as const, label: 'Туры', icon: Map }, { id: 'bookings' as const, label: 'Брони', icon: ClipboardList }, { id: 'chats' as const, label: 'Поддержка', icon: MessageCircle }, { id: 'settings' as const, label: 'Настройки', icon: Settings }].map(item => <button key={item.id} onClick={() => selectTab(item.id)} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-black ${activeTab === item.id ? 'bg-brand/10 text-brand-dark' : 'text-slate-500'}`}><item.icon className="size-5"/>{item.label}</button>)}
    </nav>
  </main>;
}
