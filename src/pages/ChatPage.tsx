import { ArrowLeft, Headphones, LoaderCircle, Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SupportChatProvider, useSupportChat, type SupportContact } from '../hooks/useSupportChat';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { extractPhoneDigits, formatPhone, phoneForAuth } from '../utils/phone';

export function ChatPage() {
  return <SupportChatProvider><ChatContent/></SupportChatProvider>;
}

function ChatContent() {
  const { profile } = useAuth();
  const toast = useToast();
  const { conversations, currentConversationId, sendUserMessage, setUserTyping, error, pendingUserMessages } = useSupportChat();
  const [text, setText] = useState('');
  const [contact, setContact] = useState({ name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : '', phone: extractPhoneDigits(profile?.phone ?? ''), email: profile?.email ?? '', subject: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const conversation = conversations.find(item => item.id === currentConversationId);
  const messages = [...(conversation?.messages ?? []), ...pendingUserMessages];
  const isNewConversation = !currentConversationId;
  const inputClass = 'h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-navy outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10';

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);
  useEffect(() => {
    if (isNewConversation) return;
    if (!text) { setUserTyping(false); return; }
    setUserTyping(true);
    const timer = window.setTimeout(() => setUserTyping(false), 1800);
    return () => window.clearTimeout(timer);
  }, [text, setUserTyping, isNewConversation]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const cleanText = text.trim();
    if (!cleanText || submitting) return;
    let supportContact: SupportContact | undefined;
    if (isNewConversation) {
      if (contact.name.trim().length < 2 || contact.phone.length !== 10 || !/^\S+@\S+\.\S+$/.test(contact.email) || !contact.subject.trim()) {
        setFormError('Заполните имя, телефон, Email и тему обращения.'); return;
      }
      supportContact = { name: contact.name.trim(), phone: phoneForAuth(contact.phone), email: contact.email.trim().toLowerCase(), subject: contact.subject.trim() };
    }
    setSubmitting(true); setFormError('');
    try {
      await sendUserMessage(cleanText, supportContact);
      setText(''); setUserTyping(false);
      toast.success('Сообщение успешно отправлено', 'Наш менеджер свяжется с вами в ближайшее время.');
    } catch {
      toast.error('Не удалось отправить сообщение', 'Проверьте подключение к интернету или попробуйте позже.');
    } finally { setSubmitting(false); }
  }

  return <main className="min-h-screen bg-[#edf5f1] px-3 py-3 sm:grid sm:place-items-center sm:p-6">
    <Helmet><title>Поддержка Next Tour</title><meta name="description" content="Онлайн-поддержка туристического агентства Next Tour"/></Helmet>
    <section className="mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(7,29,52,.16)] sm:h-[min(780px,calc(100vh-3rem))] sm:min-h-0">
      <header className="flex items-center gap-3 bg-navy p-4 text-white sm:gap-4 sm:p-6"><Link to="/" aria-label="Вернуться на главную" className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"><ArrowLeft className="size-5"/></Link><span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand sm:size-12"><Headphones className="size-6"/></span><div><h1 className="text-lg font-black sm:text-xl">Поддержка Next Tour</h1><p className="mt-0.5 flex items-center gap-2 text-xs text-white/65"><span className="size-2 rounded-full bg-brand"/>Онлайн 24/7 · ответ около 5 минут</p></div></header>

      {isNewConversation ? <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 sm:p-8"><div className="mx-auto max-w-2xl"><p className="text-xs font-black uppercase tracking-[.18em] text-brand-dark">Связаться с менеджером</p><h2 className="mt-2 text-2xl font-black tracking-tight text-navy sm:text-3xl">Чем мы можем помочь?</h2><p className="mt-2 text-sm leading-6 text-slate-500">Оставьте сообщение — обращение сразу появится в админ-панели.</p><div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Имя *</span><input autoFocus required value={contact.name} onChange={event => setContact(current => ({ ...current, name: event.target.value }))} className={inputClass}/></label>
        <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Телефон *</span><input required type="tel" inputMode="numeric" value={formatPhone(contact.phone)} onChange={event => setContact(current => ({ ...current, phone: extractPhoneDigits(event.target.value) }))} className={inputClass}/></label>
        <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Email *</span><input required type="email" value={contact.email} onChange={event => setContact(current => ({ ...current, email: event.target.value }))} className={inputClass}/></label>
        <label><span className="mb-1.5 block text-xs font-bold text-slate-500">Тема обращения *</span><select required value={contact.subject} onChange={event => setContact(current => ({ ...current, subject: event.target.value }))} className={inputClass}><option value="">Выберите тему</option><option>Подбор тура</option><option>Бронирование</option><option>Оплата</option><option>Изменение заявки</option><option>Другое</option></select></label>
        <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-500">Сообщение *</span><textarea required minLength={3} rows={5} value={text} onChange={event => setText(event.target.value)} placeholder="Опишите ваш вопрос…" className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-navy outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"/></label>
      </div>{formError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">{formError}</p>}<button disabled={submitting || !text.trim()} className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand font-black text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark disabled:opacity-50">{submitting ? <LoaderCircle className="size-5 animate-spin"/> : <Send className="size-5"/>}{submitting ? 'Отправляем…' : 'Отправить сообщение'}</button></div></form> : <>
        <div ref={chatRef} className="flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(0,200,83,.08),transparent_35%)] p-4 sm:p-7"><p className="text-center text-xs font-semibold text-slate-400">Сегодня</p>{messages.map(message => message.role === 'system' ? <div key={message.id} className="mx-auto max-w-md rounded-xl bg-amber-50 px-4 py-2 text-center text-xs font-semibold leading-5 text-amber-700">{message.text}</div> : <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[70%] ${message.role === 'user' ? 'rounded-br-sm bg-brand font-semibold text-white' : 'rounded-bl-sm border border-slate-100 bg-white text-slate-600'}`}><p>{message.text}</p><p className={`mt-1 text-right text-[10px] ${message.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>{new Date(message.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p></div></div>)}{conversation?.managerTyping && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-semibold text-slate-500 shadow-sm">Менеджер печатает <span className="flex gap-1">{[0,1,2].map(index => <span key={index} className="size-1.5 animate-bounce rounded-full bg-brand" style={{ animationDelay: `${index * 120}ms` }}/>)}</span></div></div>}</div>
        {error && <p className="bg-red-50 px-4 py-2 text-center text-xs font-bold text-red-600">Не удалось обновить чат. Проверьте интернет-соединение.</p>}
        <form onSubmit={submit} className="flex gap-2 border-t border-slate-100 bg-white p-3 pr-20 sm:p-5 sm:pr-24"><input value={text} onChange={event => setText(event.target.value)} placeholder="Напишите сообщение…" className="h-13 min-w-0 flex-1 rounded-2xl bg-slate-100 px-4 text-sm font-semibold text-navy outline-none focus:ring-4 focus:ring-brand/10"/><button disabled={!text.trim() || submitting} className="grid size-13 shrink-0 place-items-center rounded-2xl bg-brand text-white disabled:opacity-40" aria-label="Отправить сообщение">{submitting ? <LoaderCircle className="size-5 animate-spin"/> : <Send className="size-5"/>}</button></form>
      </>}
    </section>
  </main>;
}
