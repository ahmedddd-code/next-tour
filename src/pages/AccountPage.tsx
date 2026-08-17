import { Bookmark, Briefcase, CalendarDays, MapPin, Settings, UserRound } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { formatPrice } from '../data/tours';
import { BookingsProvider, useBookings } from '../hooks/useBookings';
import { useAuth } from '../hooks/useAuth';
import { TourCard } from '../components/TourCard';
import { useFavorites } from '../hooks/useTourMemory';
import { useTours } from '../hooks/useTours';

type Tab = 'profile' | 'bookings' | 'favorites' | 'settings';
const tabs: Array<{ id: Tab; label: string; icon: typeof UserRound }> = [
  { id: 'profile', label: 'Мой профиль', icon: UserRound }, { id: 'bookings', label: 'Мои бронирования', icon: Briefcase },
  { id: 'favorites', label: 'Избранные туры', icon: Bookmark }, { id: 'settings', label: 'Настройки', icon: Settings },
];

export function AccountPage() {
  return <BookingsProvider><AccountContent/></BookingsProvider>;
}

function AccountContent() {
  const { user, profile, loading, openAuth, logout } = useAuth();
  const { bookings } = useBookings();
  const { allTours } = useTours();
  const { favorites } = useFavorites();
  const favoriteTours = allTours.filter(tour => favorites.some(item => item.id === tour.id));
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab') as Tab | null;
  const active = tabs.some(tab => tab.id === requested) ? requested! : 'profile';

  if (!loading && !user) return <main className="min-h-screen bg-mist"><div className="h-20 bg-navy"><Header/></div><div className="section-shell grid min-h-[65vh] place-items-center py-16"><div className="max-w-lg rounded-[28px] bg-white p-9 text-center shadow-xl"><span className="mx-auto grid size-16 place-items-center rounded-full bg-brand/10"><UserRound className="size-8 text-brand-dark"/></span><h1 className="mt-5 text-3xl font-black">Войдите в аккаунт</h1><p className="mt-3 text-sm leading-6 text-slate-500">Здесь будут ваши данные, заявки и избранные туры.</p><button onClick={() => openAuth('login')} className="mt-7 rounded-2xl bg-brand px-8 py-3.5 font-black text-white">Войти</button></div></div><Footer/></main>;
  if (!profile) return <div className="grid min-h-screen place-items-center bg-mist"><span className="size-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand"/></div>;

  return <main className="min-h-screen bg-[#f4f8f5]"><Helmet><title>Личный кабинет — NEXT TOUR</title><meta name="robots" content="noindex,nofollow"/></Helmet><div className="h-20 bg-navy"><Header/></div><div className="section-shell py-10 sm:py-14"><div className="mb-8"><p className="text-xs font-black uppercase tracking-[.18em] text-brand-dark">Личный кабинет</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-5xl">Здравствуйте, {profile.firstName}</h1></div>
    <div className="grid gap-7 lg:grid-cols-[260px_1fr]"><aside className="h-fit rounded-3xl bg-white p-3 shadow-sm">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setParams({ tab: id })} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-black transition ${active === id ? 'bg-navy text-white shadow-lg' : 'text-slate-500 hover:bg-mist hover:text-navy'}`}><Icon className={`size-5 ${active === id ? 'text-brand' : ''}`}/>{label}</button>)}</aside>
      <section className="min-w-0 rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
        {active === 'profile' && <div><h2 className="text-2xl font-black">Личные данные</h2><div className="mt-7 grid gap-4 sm:grid-cols-2">{[['Имя', profile.firstName], ['Фамилия', profile.lastName], ['Отчество', profile.middleName || '—'], ['Телефон', profile.phone], ['Email', profile.email], ['Дата рождения', profile.birthDate || '—'], ['Город', profile.city || '—']].map(([label, value]) => <div key={label} className="rounded-2xl bg-mist p-4"><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-1 font-black text-navy">{value}</p></div>)}</div></div>}
        {active === 'bookings' && <div><h2 className="text-2xl font-black">Мои бронирования</h2><p className="mt-2 text-sm text-slate-500">Все заявки, отправленные из вашего аккаунта.</p><div className="mt-7 space-y-4">{bookings.map(booking => <article key={booking.id} className="rounded-2xl border border-slate-100 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black text-navy">{booking.tourHotel}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin className="size-4 text-brand"/>{booking.tourDestination}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-black ${booking.status === 'new' ? 'bg-amber-50 text-amber-700' : 'bg-brand/10 text-brand-dark'}`}>{booking.status === 'new' ? 'На рассмотрении' : 'Обработана'}</span></div><div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-slate-500"><span className="flex items-center gap-1"><CalendarDays className="size-4"/>{booking.tripDate || 'Дата уточняется'}</span><span>{booking.adults} взрослых · {booking.children} детей</span><span className="text-navy">{formatPrice(booking.tourPrice)}</span></div></article>)}{bookings.length === 0 && <div className="rounded-2xl bg-mist py-14 text-center"><Briefcase className="mx-auto size-10 text-slate-300"/><p className="mt-3 font-black">Заявок пока нет</p><p className="mt-1 text-sm text-slate-500">Выберите тур и отправьте первую заявку.</p></div>}</div></div>}
        {active === 'favorites' && <div><h2 className="text-2xl font-black">Избранные туры</h2><p className="mt-2 text-sm text-slate-500">Сохранённые предложения и изменения их стоимости.</p>{favoriteTours.length > 0 ? <div className="mt-7 grid gap-5 xl:grid-cols-2">{favoriteTours.map(tour => { const savedPrice = favorites.find(item => item.id === tour.id)?.savedPrice ?? tour.price; return <div key={tour.id} className="min-w-0">{tour.price < savedPrice && <p className="mb-2 rounded-xl bg-brand/10 px-3 py-2 text-xs font-black text-brand-dark">Цена снизилась на {formatPrice(savedPrice - tour.price)}</p>}<TourCard tour={tour}/></div>; })}</div> : <div className="py-16 text-center"><Bookmark className="mx-auto size-12 text-brand"/><h3 className="mt-4 text-xl font-black">Пока ничего не сохранено</h3><p className="mt-2 text-sm text-slate-500">Нажмите на сердечко в карточке понравившегося тура.</p></div>}</div>}
        {active === 'settings' && <div><h2 className="text-2xl font-black">Настройки</h2><div className="mt-6 rounded-2xl bg-mist p-5"><p className="font-black">Безопасная сессия</p><p className="mt-2 text-sm leading-6 text-slate-500">Вход защищён Supabase Auth. Сессия автоматически обновляется с помощью JWT.</p></div><button onClick={() => void logout()} className="mt-6 rounded-2xl bg-red-50 px-6 py-3 text-sm font-black text-red-600 hover:bg-red-100">Выйти из аккаунта</button></div>}
      </section></div></div><Footer/></main>;
}
