import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTours } from '../hooks/useTours';
import { DestinationAutocomplete } from './DestinationAutocomplete';
import { DepartureCitySelector } from './DepartureCitySelector';
import { useDepartureCity } from '../hooks/useDepartureCity';

export function TourSearch({ standalone = false }: { standalone?: boolean }) {
  const { tours } = useTours();
  const navigate = useNavigate();
  const { city } = useDepartureCity();
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('2026-09-14');
  const [tourists, setTourists] = useState('2');
  const [budget, setBudget] = useState('2500000');
  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set('query', destination.trim());
    params.set('departure', city);
    params.set('date', date);
    params.set('tourists', tourists);
    params.set('budget', budget);
    navigate(`/tours${params.size ? `?${params}` : ''}`);
  }
  return (
    <div id="search" className={`section-shell relative z-20 scroll-mt-24 ${standalone ? 'py-6 sm:py-8' : '-mt-24'}`}>
      <form onSubmit={submit} className="rounded-[28px] bg-white p-4 shadow-[0_25px_70px_rgba(7,29,52,.16)] md:p-6">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1.05fr_1.1fr_.9fr_.9fr_1fr_auto]">
          <DepartureCitySelector variant="search" className="w-full"/>
          <DestinationAutocomplete tours={tours} value={destination} onChange={setDestination}/>
          <label className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"><span className="text-[11px] font-extrabold uppercase tracking-[.12em] text-slate-400">Дата</span><input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full bg-transparent text-sm font-bold outline-none"/></label>
          <label className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"><span className="text-[11px] font-extrabold uppercase tracking-[.12em] text-slate-400">Туристы</span><select value={tourists} onChange={e => setTourists(e.target.value)} className="mt-1 w-full bg-transparent text-sm font-bold outline-none">{[1,2,3,4,5,6].map(value => <option key={value} value={value}>{value} чел.</option>)}</select></label>
          <label className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"><span className="text-[11px] font-extrabold uppercase tracking-[.12em] text-slate-400">Бюджет</span><select value={budget} onChange={e => setBudget(e.target.value)} className="mt-1 w-full bg-transparent text-sm font-bold outline-none"><option value="750000">до 750 000 ₸</option><option value="1500000">до 1 500 000 ₸</option><option value="2500000">до 2 500 000 ₸</option><option value="5000000">до 5 000 000 ₸</option></select></label>
          <button className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-brand px-7 font-extrabold text-white transition hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/25 sm:col-span-2 xl:col-span-1"><Search className="size-5" /> Найти</button>
        </div>
      </form>
    </div>
  );
}
