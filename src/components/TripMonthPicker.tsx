import { CalendarDays } from 'lucide-react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

function monthValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

const availableMonths = Array.from({ length: 36 }, (_, index) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + index);
  return {
    value: monthValue(date),
    label: new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(date),
    shortLabel: new Intl.DateTimeFormat('ru-RU', { month: 'short' }).format(date).replace('.', ''),
  };
});
const quickMonths = availableMonths.slice(0, 4);

export function TripMonthPicker({ value, onChange, compact = false }: Props) {
  const input = <div className="relative mt-1">
    <CalendarDays className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-brand-dark"/>
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      aria-label="Месяц поездки"
      className="w-full cursor-pointer bg-transparent pl-6 text-sm font-bold capitalize text-navy outline-none"
    >
      <option value="">Любой месяц</option>
      {availableMonths.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
    </select>
  </div>;

  if (compact) return <label className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
    <span className="text-[11px] font-extrabold uppercase tracking-[.12em] text-slate-400">Месяц поездки</span>
    {input}
  </label>;

  return <div>
    <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Месяц поездки</span>
    <label className="block h-12 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
      {input}
    </label>
    <div className="mt-2 grid grid-cols-4 gap-1.5">
      {quickMonths.map(month => <button
        key={month.value}
        type="button"
        onClick={() => onChange(month.value)}
        className={`rounded-lg px-1 py-2 text-[11px] font-black capitalize transition ${value === month.value ? 'bg-brand text-white' : 'bg-mist text-slate-500 hover:bg-brand/15 hover:text-brand-dark'}`}
      >{month.shortLabel}</button>)}
    </div>
  </div>;
}
