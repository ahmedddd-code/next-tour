import { CalendarDays, Search, Users, WalletCards } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTours } from '../hooks/useTours';
import { DestinationAutocomplete } from './DestinationAutocomplete';
import { DepartureCitySelector } from './DepartureCitySelector';
import { useDepartureCity } from '../hooks/useDepartureCity';

const fields = [
  { label: 'Дата', value: '2026-09-14', icon: CalendarDays, type: 'date' },
  { label: 'Туристы', value: '2 взрослых', icon: Users, type: 'text' },
  { label: 'Бюджет', value: 'до 2 500 000 ₸', icon: WalletCards, type: 'text' },
];

export function TourSearch({ standalone = false }: { standalone?: boolean }) {
  const { tours } = useTours();
  const navigate = useNavigate();
  const { city } = useDepartureCity();
  const [destination, setDestination] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set('query', destination.trim());
    params.set('departure', city);
    navigate(`/tours${params.size ? `?${params}` : ''}`);
  }
  return (
    <div id="search" className={`section-shell relative z-20 scroll-mt-24 ${standalone ? 'py-6 sm:py-8' : '-mt-24'}`}>
      <form onSubmit={submit} className="rounded-[28px] bg-white p-4 shadow-[0_25px_70px_rgba(7,29,52,.16)] md:p-6">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1.05fr_1.1fr_.9fr_.9fr_1fr_auto]">
          <DepartureCitySelector variant="search" className="w-full"/>
          <DestinationAutocomplete tours={tours} value={destination} onChange={setDestination}/>
          {fields.map(({ label, value, icon: Icon, type }) => <label key={label} className="group rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition focus-within:border-brand/40 focus-within:bg-white">
            <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[.12em] text-slate-400"><Icon className="size-3.5 text-brand" />{label}</span>
            <input type={type} defaultValue={value} className="mt-1 w-full bg-transparent text-sm font-bold text-navy outline-none" />
          </label>)}
          <button className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-brand px-7 font-extrabold text-white transition hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/25 sm:col-span-2 xl:col-span-1"><Search className="size-5" /> Найти</button>
        </div>
      </form>
    </div>
  );
}
