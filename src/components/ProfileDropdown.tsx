import { Bookmark, Briefcase, ChevronRight, LogOut, Settings, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UserProfile } from '../hooks/useAuth';

const items = [
  { label: 'Мой профиль', tab: 'profile', icon: UserRound },
  { label: 'Мои бронирования', tab: 'bookings', icon: Briefcase },
  { label: 'Избранные туры', tab: 'favorites', icon: Bookmark },
  { label: 'Настройки', tab: 'settings', icon: Settings },
];

export function ProfileDropdown({ profile, onNavigate, onLogout }: { profile: UserProfile; onNavigate: () => void; onLogout: () => void }) {
  return <div className="absolute right-0 top-[calc(100%+12px)] w-72 overflow-hidden rounded-3xl border border-slate-100 bg-white p-2 text-navy shadow-[0_24px_70px_rgba(7,29,52,.2)]">
    <div className="rounded-2xl bg-mist p-4"><p className="font-black">{profile.firstName} {profile.lastName}</p><p className="mt-1 truncate text-xs text-slate-500">{profile.email}</p></div>
    <nav className="mt-2">{items.map(({ label, tab, icon: Icon }) => <Link key={tab} to={`/account?tab=${tab}`} onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition hover:bg-slate-50"><Icon className="size-4 text-brand-dark"/><span className="flex-1">{label}</span><ChevronRight className="size-4 text-slate-300"/></Link>)}</nav>
    <button onClick={onLogout} className="mt-1 flex w-full items-center gap-3 border-t border-slate-100 px-3 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50"><LogOut className="size-4"/>Выйти</button>
  </div>;
}
