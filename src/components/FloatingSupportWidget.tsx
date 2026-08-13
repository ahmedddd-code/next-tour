import { Headphones, MessageCircleMore, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type Props = {
  chatUrl?: string;
};

const SESSION_KEY = 'nexttour:support-greeting-shown';

export function FloatingSupportWidget({ chatUrl = '/chat' }: Props) {
  const navigate = useNavigate();
  const { requestAuth } = useAuth();
  const [greetingVisible, setGreetingVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    let hideTimer: number | undefined;
    const greetingTimer = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setGreetingVisible(true);
      hideTimer = window.setTimeout(() => setGreetingVisible(false), 5000);
    }, 6000);
    return () => {
      window.clearTimeout(greetingTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, []);

  function navigateToSupport() {
    setGreetingVisible(false);
    if (/^https?:\/\//.test(chatUrl)) window.open(chatUrl, '_blank', 'noopener,noreferrer');
    else navigate(chatUrl);
  }
  function openSupport() { requestAuth(navigateToSupport); }

  return <div className="group fixed bottom-4 right-4 z-[9999] sm:bottom-6 sm:right-6">
    {greetingVisible && <div className="absolute bottom-[calc(100%+12px)] right-0 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl animate-[support-message_.3s_ease-out]">
      <button onClick={openSupport} className="block w-full p-4 pr-10 text-left transition hover:bg-slate-50">
        <span className="flex items-center gap-2 text-sm font-black text-navy"><MessageCircleMore className="size-4 text-brand"/>Поддержка Next Tour</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">Здравствуйте! Нужна помощь с подбором тура?</span>
      </button>
      <button onClick={() => setGreetingVisible(false)} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-navy" aria-label="Закрыть сообщение поддержки"><X className="size-4"/></button>
    </div>}

    <div className="pointer-events-none absolute bottom-1/2 right-[calc(100%+14px)] hidden translate-x-5 translate-y-1/2 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 md:block">
      <button onClick={openSupport} className="flex w-64 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-2xl transition hover:bg-slate-50">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand-dark"><Headphones className="size-5"/></span>
        <span><strong className="block text-sm text-navy">Поддержка 24/7</strong><span className="mt-0.5 block text-xs text-slate-500">Мы онлайн и готовы помочь</span></span>
      </button>
    </div>

    <span aria-hidden="true" className="absolute inset-0 rounded-full bg-brand/25 [animation:support-pulse_5s_ease-in-out_infinite] group-hover:bg-brand/35"/>
    <button onClick={openSupport} aria-label="Открыть поддержку Next Tour" className="relative grid size-16 place-items-center rounded-full bg-gradient-to-br from-brand via-emerald-500 to-brand-dark text-white shadow-[0_14px_35px_rgba(0,170,80,.4)] transition duration-300 hover:scale-110 hover:shadow-[0_16px_45px_rgba(0,200,83,.55)] focus:outline-none focus:ring-4 focus:ring-brand/30 sm:size-[72px]">
      <Headphones className="size-7 transition duration-300 group-hover:-rotate-6 group-hover:scale-110 sm:size-8"/>
      <span className="absolute right-1 top-1 size-3 rounded-full border-2 border-white bg-amber-400 sm:right-1.5 sm:top-1.5"/>
    </button>
  </div>;
}
