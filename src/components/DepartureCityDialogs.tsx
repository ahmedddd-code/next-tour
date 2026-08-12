import { Check, MapPin, Plane, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cityInGenitive, kazakhstanCities, popularCities } from '../data/kazakhstanCities';
import { useDepartureCity } from '../hooks/useDepartureCity';

export function DepartureCityDialogs() {
  const { city, detectedCity, confirmationOpen, selectorOpen, detectedAutomatically, confirmDetectedCity, openSelector, closeSelector, selectCity } = useDepartureCity();
  const [query, setQuery] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const cities = useMemo(() => kazakhstanCities.filter(item => item.name.toLowerCase().includes(query.trim().toLowerCase())), [query]);

  useEffect(() => {
    if (!selectorOpen) setQuery('');
    document.body.style.overflow = selectorOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectorOpen]);

  function confirmCity() {
    confirmDetectedCity();
    setNoticeVisible(true);
    window.setTimeout(() => setNoticeVisible(false), 5000);
  }

  return <>
    {confirmationOpen && detectedCity && <div className="fixed inset-x-3 bottom-3 z-[9998] animate-[city-card_.35s_ease-out] rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-24 sm:w-[360px]">
      <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600"><MapPin className="size-5"/></span><div><h2 className="text-lg font-black text-navy">Вы из {cityInGenitive(detectedCity)}?</h2><p className="mt-1 text-xs leading-5 text-slate-500">{detectedAutomatically ? 'Город определён автоматически. Покажем подходящие вылеты.' : 'Выберите город, чтобы увидеть подходящие туры.'}</p></div></div>
      <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={confirmCity} className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-3 text-xs font-black text-white hover:bg-blue-700"><Check className="size-4"/>Да, верно</button><button onClick={openSelector} className="rounded-xl bg-slate-100 px-3 py-3 text-xs font-black text-navy hover:bg-slate-200">Нет, выбрать другой</button></div>
    </div>}

    {noticeVisible && !selectorOpen && <div className="fixed left-1/2 top-24 z-[9997] flex w-[min(92vw,460px)] -translate-x-1/2 items-center gap-3 rounded-2xl bg-navy p-4 text-white shadow-2xl animate-[city-card_.35s_ease-out]"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/20"><Plane className="size-5 text-brand"/></span><p className="min-w-0 flex-1 text-sm font-bold">Мы подобрали туры с вылетом из {cityInGenitive(city)}</p><button onClick={() => { setNoticeVisible(false); openSelector(); }} className="shrink-0 text-xs font-black text-brand">Изменить город</button></div>}

    {selectorOpen && <div onMouseDown={event => { if (event.target === event.currentTarget) closeSelector(); }} className="fixed inset-0 z-[10000] flex items-end bg-navy/60 backdrop-blur-sm sm:grid sm:place-items-center sm:p-6">
      <section role="dialog" aria-modal="true" aria-labelledby="city-dialog-title" className="flex max-h-[88vh] w-full flex-col rounded-t-[28px] bg-white shadow-2xl animate-[city-sheet_.3s_ease-out] sm:max-w-2xl sm:rounded-[28px]">
        <header className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6"><div><p className="text-xs font-black uppercase tracking-wider text-blue-600">Next Tour</p><h2 id="city-dialog-title" className="mt-1 text-2xl font-black text-navy">Выберите город вылета</h2></div><button onClick={closeSelector} className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500 hover:text-navy" aria-label="Закрыть"><X className="size-5"/></button></header>
        <div className="overflow-y-auto p-5 sm:p-6"><div className="relative"><Search className="absolute left-4 top-3.5 size-5 text-slate-400"/><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти город" className="h-12 w-full rounded-2xl border border-slate-200 pl-12 pr-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"/></div>
          {!query && <div className="mt-6"><p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">Популярные города</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{popularCities.map(item => <button key={item.name} onClick={() => selectCity(item.name)} className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-sm font-black text-blue-700 transition hover:bg-blue-100"><Plane className="size-4"/>{item.name}</button>)}</div></div>}
          <div className="mt-6"><p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">{query ? 'Результаты' : 'Все города Казахстана'}</p><div className="grid gap-1 sm:grid-cols-2">{cities.map(item => <button key={item.name} onClick={() => selectCity(item.name)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition hover:bg-slate-100 ${item.name === city ? 'bg-brand/10 text-brand-dark' : 'text-navy'}`}><Plane className="size-4 shrink-0 text-blue-600"/><span className="flex-1">{item.name}</span>{item.name === city && <Check className="size-4"/>}</button>)}</div>{cities.length === 0 && <p className="py-10 text-center text-sm text-slate-500">Город не найден</p>}</div>
        </div>
      </section>
    </div>}
  </>;
}
