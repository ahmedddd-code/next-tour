import { CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

function monthValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

const quickMonths = Array.from({ length: 4 }, (_, index) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + index);
  return {
    value: monthValue(date),
    label: new Intl.DateTimeFormat('ru-RU', { month: 'short' }).format(date).replace('.', ''),
  };
});

function displayDate(value: string) {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}.${month}.${year}` : '';
}

function maskDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('.');
}

function isoDate(value: string) {
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return null;
  const [day, month, year] = value.split('.').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function TripMonthPicker({ value, onChange, compact = false }: Props) {
  const [draft, setDraft] = useState(() => displayDate(value));
  useEffect(() => setDraft(displayDate(value)), [value]);

  function changeDate(text: string) {
    const masked = maskDate(text);
    setDraft(masked);
    if (!masked) onChange('');
    const iso = isoDate(masked);
    if (iso) onChange(iso);
  }

  const input = <div className="relative mt-1">
    <CalendarDays className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-brand-dark"/>
    <input
      type="text"
      inputMode="numeric"
      dir="ltr"
      value={draft}
      onChange={event => changeDate(event.target.value)}
      placeholder="дд.мм.гггг"
      aria-label="Дата поездки в формате день, месяц, год"
      className="w-full bg-transparent pl-6 text-left text-sm font-bold text-navy outline-none placeholder:font-semibold placeholder:text-slate-400"
    />
  </div>;

  if (compact) return <label className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
    <span className="text-[11px] font-extrabold uppercase tracking-[.12em] text-slate-400">Дата поездки</span>
    {input}
  </label>;

  return <div>
    <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Дата поездки</span>
    <label className="block h-12 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
      {input}
    </label>
    <div className="mt-2 grid grid-cols-4 gap-1.5">
      {quickMonths.map(month => <button
        key={month.value}
        type="button"
        onClick={() => onChange(`${month.value}-01`)}
        className={`rounded-lg px-1 py-2 text-[11px] font-black capitalize transition ${value.startsWith(month.value) ? 'bg-brand text-white' : 'bg-mist text-slate-500 hover:bg-brand/15 hover:text-brand-dark'}`}
      >{month.label}</button>)}
    </div>
  </div>;
}
