import { Menu, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { DepartureCitySelector } from './DepartureCitySelector';
import { useAuth } from '../hooks/useAuth';
import { UserMenu } from './UserMenu';
import { SectionLink } from './SectionLink';

const sectionLinks = [['Направления', 'destinations'], ['AI-помощник', 'ai'], ['Отзывы', 'reviews'], ['Контакты', 'contacts']];

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, loading, openAuth } = useAuth();
  return (
    <header className="absolute inset-x-0 top-0 z-30 border-b border-white/15 bg-navy/10 backdrop-blur-sm">
      <div className="section-shell flex h-20 items-center justify-between">
        <Logo light />
        <nav className="hidden items-center gap-7 lg:flex">
          <Link to="/tours" className="text-sm font-semibold text-white/85 transition hover:text-white">Туры</Link>
          {sectionLinks.map(([label, section]) => <SectionLink key={section} section={section} className="text-sm font-semibold text-white/85 transition hover:text-white">{label}</SectionLink>)}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <DepartureCitySelector variant="header" className="py-2"/>
          <a href="tel:+77071819912" className="hidden items-center gap-2 text-sm font-bold text-white xl:flex"><Phone className="size-4" />+7 (707) 181-99-12</a>
          {!loading && (user ? <UserMenu light/> : <button onClick={() => openAuth('login')} className="rounded-full border border-white/25 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-white/10">Войти</button>)}
          <Link to="/tours" className="rounded-full bg-brand px-5 py-3 text-sm font-extrabold text-white transition hover:bg-brand-dark">Найти тур</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="grid size-11 place-items-center rounded-full bg-white/15 text-white sm:hidden" aria-label="Открыть меню">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && <nav className="mx-4 mb-4 flex flex-col rounded-2xl bg-white p-3 shadow-2xl sm:hidden">
        <DepartureCitySelector className="mb-2 w-full"/>
        <Link to="/tours" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 font-bold text-navy hover:bg-mist">Туры</Link>
        {sectionLinks.map(([label, section]) => <SectionLink key={section} section={section} onNavigate={() => setOpen(false)} className="rounded-xl px-4 py-3 font-bold text-navy hover:bg-mist">{label}</SectionLink>)}
        <div className="mt-2 border-t border-slate-100 pt-3">{user ? <UserMenu/> : <button onClick={() => { setOpen(false); openAuth('login'); }} className="w-full rounded-xl bg-navy px-4 py-3 text-left font-black text-white">Войти в аккаунт</button>}</div>
      </nav>}
    </header>
  );
}
