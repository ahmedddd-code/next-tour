import { Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function HomeShortcut() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 96);
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, [pathname]);

  if (pathname === '/' || pathname.startsWith('/admin') || pathname === '/game' || pathname === '/screamer') return null;

  return <Link
    to="/"
    aria-label="Вернуться на главную"
    className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(.75rem,env(safe-area-inset-left))] z-[10050] grid size-12 place-items-center rounded-full border border-white/70 bg-navy text-white shadow-[0_10px_28px_rgba(7,29,52,.3)] transition duration-300 hover:-translate-y-1 hover:bg-brand-dark focus:outline-none focus:ring-4 focus:ring-brand/25 sm:bottom-6 sm:left-6 ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
  >
    <Home className="size-5 text-brand"/>
  </Link>;
}
