import { Scale, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCompare } from '../hooks/useTourMemory';

export function CompareShortcut() {
  const { compareIds, clearCompare } = useCompare();
  const { pathname, hash } = useLocation();
  if (!compareIds.length || (pathname === '/tours' && hash === '#comparison') || pathname.startsWith('/admin') || pathname === '/game' || pathname === '/screamer') return null;

  return <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] left-1/2 z-[80] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/20 bg-navy p-2 text-white shadow-[0_18px_55px_rgba(7,29,52,.35)] md:hidden">
    <Link to="/tours#comparison" className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-3 text-sm font-black"><Scale className="size-4"/>Сравнить ({compareIds.length}/3)</Link>
    <button type="button" onClick={clearCompare} className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10" aria-label="Очистить сравнение"><X className="size-4"/></button>
  </div>;
}
