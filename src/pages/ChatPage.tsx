import { ArrowLeft, Headphones, Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useSupportChat } from '../hooks/useSupportChat';

export function ChatPage() {
  const { conversations, currentConversationId, sendUserMessage, setUserTyping, error } = useSupportChat();
  const [text, setText] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const conversation = conversations.find(item => item.id === currentConversationId);
  const messages = conversation?.messages ?? [];

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!text) { setUserTyping(false); return; }
    setUserTyping(true);
    const timer = window.setTimeout(() => setUserTyping(false), 1800);
    return () => window.clearTimeout(timer);
  }, [text, setUserTyping]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) return;
    setUserTyping(false);
    await sendUserMessage(cleanText);
    setText('');
  }

  return <main className="min-h-screen bg-[#edf5f1] px-3 py-4 sm:grid sm:place-items-center sm:p-6">
    <Helmet><title>Поддержка Next Tour</title><meta name="description" content="Онлайн-поддержка туристического агентства Next Tour"/></Helmet>
    <section className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(7,29,52,.16)] sm:h-[min(780px,calc(100vh-3rem))]">
      <header className="flex items-center gap-4 bg-navy p-4 text-white sm:p-6"><Link to="/" aria-label="Вернуться на главную" className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"><ArrowLeft className="size-5"/></Link><span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand"><Headphones className="size-6"/></span><div><h1 className="text-lg font-black sm:text-xl">Поддержка Next Tour</h1><p className="mt-0.5 flex items-center gap-2 text-xs text-white/65"><span className="size-2 rounded-full bg-brand"/>Онлайн 24/7</p></div></header>

      <div ref={chatRef} className="flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(0,200,83,.08),transparent_35%)] p-4 sm:p-7">
        <p className="text-center text-xs font-semibold text-slate-400">Сегодня</p>
        <div className="flex justify-start"><div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-slate-100 bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm sm:max-w-[70%]">Здравствуйте! Напишите ваш вопрос — менеджер Next Tour ответит вам здесь.</div></div>
        {messages.map(message => message.role === 'system' ? <div key={message.id} className="mx-auto max-w-md rounded-xl bg-amber-50 px-4 py-2 text-center text-xs font-semibold leading-5 text-amber-700">{message.text}</div> : <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[70%] ${message.role === 'user' ? 'rounded-br-sm bg-brand font-semibold text-white' : 'rounded-bl-sm border border-slate-100 bg-white text-slate-600'}`}><p>{message.text}</p><p className={`mt-1 text-right text-[10px] ${message.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>{new Date(message.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p></div></div>)}
        {conversation?.managerTyping && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-xs font-semibold text-slate-500 shadow-sm"><span>Менеджер печатает</span><span className="flex gap-1">{[0,1,2].map(index => <span key={index} className="size-1.5 animate-bounce rounded-full bg-brand" style={{ animationDelay: `${index * 120}ms` }}/>)}</span></div></div>}
      </div>

      {error && <p className="bg-red-50 px-4 py-2 text-center text-xs font-bold text-red-600">{error}</p>}
      <form onSubmit={submit} className="flex gap-2 border-t border-slate-100 bg-white p-3 pr-20 sm:p-5 sm:pr-24"><input autoFocus value={text} onChange={event => setText(event.target.value)} placeholder="Напишите сообщение…" className="h-13 min-w-0 flex-1 rounded-2xl bg-slate-100 px-4 text-sm font-semibold text-navy outline-none transition focus:bg-white focus:ring-4 focus:ring-brand/10"/><button disabled={!text.trim()} aria-label="Отправить сообщение" className="grid size-13 shrink-0 place-items-center rounded-2xl bg-brand text-white transition hover:bg-brand-dark disabled:opacity-40"><Send className="size-5"/></button></form>
    </section>
  </main>;
}
