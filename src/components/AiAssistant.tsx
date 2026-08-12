import { ArrowRight, Bot, CheckCircle2, LoaderCircle, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAiChat } from '../hooks/useAiChat';

const quickOptions = ['🏖️ Пляж', '👨‍👩‍👧 Семейный', '💎 Luxury', '🌴 Экзотика', '🏙️ Экскурсии'];

export function AiAssistant() {
  const [prompt, setPrompt] = useState('');
  const { messages, loading, error, sendMessage } = useAiChat();
  const chatEnd = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messages.length > 1 || loading) chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);
  function submit(event: FormEvent) { event.preventDefault(); if (prompt.trim()) { void sendMessage(prompt); setPrompt(''); } }

  return <section id="ai" className="scroll-mt-24 bg-navy py-24 text-white"><div className="section-shell grid items-center gap-14 lg:grid-cols-[.85fr_1.15fr]">
    <div><div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand/15 px-4 py-2 text-sm font-extrabold text-brand"><Sparkles className="size-4"/>AI-помощник NEXT</div><h2 className="text-4xl font-black leading-tight tracking-[-.04em] sm:text-5xl">Ваш отдых начинается с одного сообщения</h2><p className="mt-5 max-w-lg text-lg leading-8 text-white/60">Расскажите об идеальной поездке. AI уточнит детали и подберёт реальные варианты из каталога NEXT TOUR.</p><ul className="mt-8 space-y-4 text-white/80">{['Учитывает бюджет и даты', 'Подбирает только реальные туры', 'Доступен в любое время'].map(item => <li key={item} className="flex items-center gap-3"><CheckCircle2 className="size-5 text-brand"/>{item}</li>)}</ul></div>
    <div className="rounded-3xl border border-white/10 bg-white/[.07] p-4 shadow-2xl backdrop-blur md:p-7"><div className="flex items-center gap-3 border-b border-white/10 pb-5"><span className="grid size-11 place-items-center rounded-full bg-brand"><Bot/></span><div><p className="font-extrabold">NEXT AI</p><p className="flex items-center gap-1.5 text-xs text-white/45"><span className="size-1.5 rounded-full bg-brand"/>{loading ? 'Подбирает варианты…' : 'Онлайн · готов помочь'}</p></div></div>
      <div className="my-5 h-72 space-y-3 overflow-y-auto pr-2 [scrollbar-color:#00c853_transparent]">{messages.map(message => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] whitespace-pre-line rounded-2xl p-4 text-sm leading-6 ${message.role === 'user' ? 'rounded-tr-sm bg-brand font-semibold text-white' : 'rounded-tl-sm bg-white/10 text-white/80'}`}>{message.text}</div></div>)}{loading && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-sm text-white/60"><LoaderCircle className="size-4 animate-spin"/>Думаю…</div></div>}<div ref={chatEnd}/></div>
      <div className="mb-3 flex flex-wrap gap-2">{quickOptions.map(option => <button key={option} disabled={loading} onClick={() => void sendMessage(option)} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:border-brand hover:text-white disabled:opacity-40">{option}</button>)}</div>
      {error && <p className="mb-3 rounded-xl bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-200">{error}</p>}
      <form onSubmit={submit} className="flex gap-2 rounded-2xl bg-white p-2"><input value={prompt} disabled={loading} onChange={event => setPrompt(event.target.value)} placeholder="Например, море в октябре до 2 000 000 ₸" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-navy outline-none disabled:opacity-50"/><button disabled={loading || !prompt.trim()} className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50" aria-label="Отправить запрос"><ArrowRight/></button></form>
    </div>
  </div></section>;
}
