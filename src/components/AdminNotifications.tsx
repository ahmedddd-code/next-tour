import { Bell, ClipboardList, MessageCircle, MessageSquareText, Volume2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBookings } from '../hooks/useBookings';
import { useReviews } from '../hooks/useReviews';
import { useSupportChat } from '../hooks/useSupportChat';

export type AdminAlertTab = 'bookings' | 'chats' | 'reviews';
type Alert = { id: string; tab: AdminAlertTab; title: string; text: string };

function playAlert(context: AudioContext) {
  const now = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(.22, now + .02);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .75);
  gain.connect(context.destination);
  [659, 880, 1047].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    oscillator.start(now + index * .12);
    oscillator.stop(now + .55 + index * .12);
  });
}

export function AdminNotifications({ onOpen }: { onOpen: (tab: AdminAlertTab) => void }) {
  const { bookings, loaded: bookingsLoaded } = useBookings();
  const { reviews, loaded: reviewsLoaded } = useReviews();
  const { conversations, loaded: chatsLoaded } = useSupportChat();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [soundReady, setSoundReady] = useState(false);
  const seen = useRef<Set<string> | null>(null);
  const audio = useRef<AudioContext | null>(null);

  const enableSound = useCallback(async () => {
    const AudioEngine = window.AudioContext ?? window.webkitAudioContext;
    audio.current ??= new AudioEngine();
    await audio.current.resume();
    setSoundReady(audio.current.state === 'running');
  }, []);

  useEffect(() => {
    const unlock = () => void enableSound();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  }, [enableSound]);

  useEffect(() => {
    if (!bookingsLoaded || !reviewsLoaded || !chatsLoaded) return;
    const items: Alert[] = [
      ...bookings.filter(item => item.status === 'new').map(item => ({ id: `booking:${item.id}`, tab: 'bookings' as const, title: 'Новая заявка на тур', text: `${item.name} · ${item.tourHotel}` })),
      ...reviews.filter(item => item.status === 'pending').map(item => ({ id: `review:${item.id}`, tab: 'reviews' as const, title: 'Новый отзыв', text: `${item.name} · ${item.rating}★` })),
      ...conversations.flatMap(conversation => conversation.messages.filter(message => message.role === 'user').map(message => ({ id: `chat:${message.id}`, tab: 'chats' as const, title: 'Новое сообщение поддержки', text: `${conversation.contact?.name || 'Клиент'}: ${message.text.slice(0, 90)}` }))),
    ];
    if (!seen.current) { seen.current = new Set(items.map(item => item.id)); return; }
    const fresh = items.filter(item => !seen.current?.has(item.id));
    items.forEach(item => seen.current?.add(item.id));
    if (!fresh.length) return;
    const latest = fresh[0];
    setAlert(fresh.length === 1 ? latest : { ...latest, title: `Новых событий: ${fresh.length}`, text: latest.title });
    if (audio.current?.state === 'running') playAlert(audio.current);
    document.title = `(${fresh.length}) Новое событие — NEXT TOUR`;
    const timer = window.setTimeout(() => { setAlert(null); document.title = 'Управление турами — NEXT TOUR'; }, 9000);
    return () => window.clearTimeout(timer);
  }, [bookings, reviews, conversations, bookingsLoaded, reviewsLoaded, chatsLoaded]);

  useEffect(() => () => { void audio.current?.close(); }, []);

  const Icon = alert?.tab === 'bookings' ? ClipboardList : alert?.tab === 'reviews' ? MessageSquareText : MessageCircle;
  return <>
    {!soundReady && <button onClick={() => void enableSound()} className="fixed bottom-24 right-4 z-[80] flex items-center gap-2 rounded-full bg-navy px-4 py-3 text-xs font-black text-white shadow-xl md:bottom-5" title="Браузер включает звук только после нажатия"><Volume2 className="size-4"/>Включить звук</button>}
    {alert && <aside className="fixed right-4 top-4 z-[100] w-[min(390px,calc(100vw-32px))] animate-toast-in overflow-hidden rounded-2xl border border-brand/20 bg-white shadow-2xl">
      <button onClick={() => setAlert(null)} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100" aria-label="Закрыть"><X className="size-4"/></button>
      <button onClick={() => { onOpen(alert.tab); setAlert(null); }} className="flex w-full gap-3 p-4 pr-12 text-left">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand/10 text-brand-dark"><Icon className="size-5"/></span>
        <span><strong className="block text-sm text-navy">{alert.title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{alert.text}</span><span className="mt-2 flex items-center gap-1 text-[11px] font-black text-brand-dark"><Bell className="size-3"/>Открыть</span></span>
      </button>
    </aside>}
  </>;
}

declare global { interface Window { webkitAudioContext: typeof AudioContext } }
