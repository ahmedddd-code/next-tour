import { Menu, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { DepartureCitySelector } from './DepartureCitySelector';

const links = [
  ['Туры', '/tours'],
  ['Направления', '/#destinations'],
  ['AI-помощник', '/#ai'],
  ['Отзывы', '/#reviews'],
  ['Контакты', '/#contacts'],
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-30 border-b border-white/15 bg-navy/10 backdrop-blur-sm">
      <div className="section-shell flex h-20 items-center justify-between">
        <Logo light />
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map(([label, href]) => <Link key={href} to={href} className="text-sm font-semibold text-white/85 transition hover:text-white">{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <DepartureCitySelector variant="header" className="py-2"/>
          <a href="tel:+77001234567" className="hidden items-center gap-2 text-sm font-bold text-white xl:flex"><Phone className="size-4" />+7 (700) 123-45-67</a>
          <Link to="/tours" className="rounded-full bg-brand px-5 py-3 text-sm font-extrabold text-white transition hover:bg-brand-dark">Найти тур</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="grid size-11 place-items-center rounded-full bg-white/15 text-white sm:hidden" aria-label="Открыть меню">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && <nav className="mx-4 mb-4 flex flex-col rounded-2xl bg-white p-3 shadow-2xl sm:hidden">
        <DepartureCitySelector className="mb-2 w-full"/>
        {links.map(([label, href]) => <Link key={href} to={href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 font-bold text-navy hover:bg-mist">{label}</Link>)}
      </nav>}
    </header>
  );
}
