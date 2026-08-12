import { ChevronDown, MapPin } from 'lucide-react';
import { useDepartureCity } from '../hooks/useDepartureCity';

type Props = { variant?: 'header' | 'search' | 'plain'; className?: string };

export function DepartureCitySelector({ variant = 'plain', className = '' }: Props) {
  const { city, openSelector } = useDepartureCity();
  const styles = variant === 'header'
    ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
    : variant === 'search'
      ? 'min-h-16 border-slate-100 bg-slate-50 text-navy hover:border-brand/40 hover:bg-white'
      : 'border-slate-200 bg-white text-navy hover:border-brand/40';
  return <button type="button" onClick={openSelector} className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left transition ${styles} ${className}`}>
    <MapPin className={`size-5 shrink-0 ${variant === 'header' ? 'text-brand' : 'text-blue-600'}`}/>
    <span className="min-w-0 flex-1"><span className={`block text-[10px] font-extrabold uppercase tracking-wider ${variant === 'header' ? 'text-white/55' : 'text-slate-400'}`}>Вылет из</span><strong className="block truncate text-sm">{city}</strong></span>
    <ChevronDown className="size-4 shrink-0 opacity-60"/>
  </button>;
}
