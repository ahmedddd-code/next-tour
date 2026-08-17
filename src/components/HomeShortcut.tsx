import { Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function HomeShortcut() {
  const { pathname } = useLocation();
  if (pathname === '/' || pathname.startsWith('/admin') || pathname === '/game' || pathname === '/screamer') return null;

  return <Link
    to="/"
    aria-label="Вернуться на главную"
    className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(.75rem,env(safe-area-inset-left))] z-[10050] flex min-h-12 items-center gap-2 rounded-full border border-white/70 bg-navy px-4 py-3 text-sm font-black text-white shadow-[0_12px_35px_rgba(7,29,52,.35)] transition hover:-translate-y-1 hover:bg-brand-dark focus:outline-none focus:ring-4 focus:ring-brand/25 sm:bottom-6 sm:left-6"
  >
    <Home className="size-5 shrink-0 text-brand"/>
    <span>На главную</span>
  </Link>;
}
