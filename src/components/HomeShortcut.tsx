import { Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function HomeShortcut() {
  const { pathname } = useLocation();
  if (pathname === '/' || pathname.startsWith('/admin') || pathname === '/game' || pathname === '/screamer') return null;

  return <Link
    to="/"
    aria-label="Вернуться на главную"
    className="fixed bottom-4 left-3 z-[9990] flex min-h-12 items-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 py-3 text-sm font-black text-navy shadow-[0_12px_35px_rgba(7,29,52,.2)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white focus:outline-none focus:ring-4 focus:ring-brand/25 sm:bottom-6 sm:left-6"
  >
    <Home className="size-5 text-brand-dark"/>
    <span className="hidden min-[380px]:inline">На главную</span>
  </Link>;
}
