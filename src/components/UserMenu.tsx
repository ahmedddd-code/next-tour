import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProfileDropdown } from './ProfileDropdown';

export function UserMenu({ light = false }: { light?: boolean }) {
  const { profile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  if (!profile) return null;
  const initial = (profile.firstName || profile.email || 'N').charAt(0).toUpperCase();
  return <div ref={rootRef} className="relative">
    <button onClick={() => setOpen(value => !value)} className={`flex items-center gap-2 rounded-full p-1.5 pr-3 text-sm font-black transition ${light ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-mist text-navy hover:bg-brand/10'}`} aria-expanded={open}>
      <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand to-emerald-700 text-white shadow-md">{initial}</span><span className="max-w-24 truncate">{profile.firstName || 'Профиль'}</span><ChevronDown className={`size-4 transition ${open ? 'rotate-180' : ''}`}/>
    </button>
    {open && <ProfileDropdown profile={profile} onNavigate={() => setOpen(false)} onLogout={() => { setOpen(false); void logout(); }}/>} 
  </div>;
}
