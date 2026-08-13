import { CheckCircle2, MessageCircle, Send, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSupportChat } from '../hooks/useSupportChat';

export function AdminSupportChats() {
  const { conversations, sendManagerMessage, toggleConversationStatus, deleteConversation, setManagerTyping, error } = useSupportChat();
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id ?? null);
  const [reply, setReply] = useState('');
  const messagesRef = useRef<HTMLDivElement>(null);
  const selected = conversations.find(conversation => conversation.id === selectedId) ?? conversations[0];

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [selected?.messages]);

  useEffect(() => {
    if (!selected) return;
    if (!reply) { setManagerTyping(selected.id, false); return; }
    setManagerTyping(selected.id, true);
    const timer = window.setTimeout(() => setManagerTyping(selected.id, false), 1800);
    return () => window.clearTimeout(timer);
  }, [reply, selected?.id, setManagerTyping]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    const cleanReply = reply.trim();
    setReply('');
    setManagerTyping(selected.id, false);
    void sendManagerMessage(selected.id, cleanReply);
  }

  return <section><div className="mb-6"><p className="text-xs font-black uppercase tracking-[.18em] text-brand-dark">Поддержка</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">Чаты с клиентами</h1><p className="mt-2 text-sm text-slate-500">Открытых диалогов: {conversations.filter(item => item.status === 'open').length} · ожидают клиента: {conversations.filter(item => item.status === 'pending_close').length}</p></div>
    {conversations.length === 0 ? <div className="rounded-3xl bg-white py-20 text-center shadow-sm"><MessageCircle className="mx-auto size-12 text-slate-300"/><p className="mt-4 font-black text-navy">Сообщений пока нет</p></div> : <div className="grid min-h-[620px] overflow-hidden rounded-3xl bg-white shadow-sm lg:grid-cols-[300px_1fr]">
      <aside className="max-h-56 overflow-y-auto border-b border-slate-100 lg:max-h-none lg:border-b-0 lg:border-r"><div className="border-b border-slate-100 p-4 font-black text-navy">Диалоги</div>{conversations.map(conversation => { const firstMessage = conversation.messages.find(message => message.role === 'user'); return <button key={conversation.id} onClick={() => setSelectedId(conversation.id)} className={`block w-full border-b border-slate-100 p-4 text-left transition ${selected?.id === conversation.id ? 'bg-brand/10' : 'hover:bg-slate-50'}`}><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-navy">{conversation.contact?.name || `Клиент ${conversation.id.slice(-5)}`}</strong><span className={`size-2 shrink-0 rounded-full ${conversation.status === 'open' ? 'bg-brand' : conversation.status === 'pending_close' ? 'bg-amber-400' : 'bg-slate-300'}`}/></span><span className="mt-1 block truncate text-xs font-semibold text-brand-dark">{conversation.contact?.subject}</span><span className="mt-1 block truncate text-xs text-slate-500">{firstMessage?.text}</span><span className="mt-1 block text-[10px] text-slate-400">{new Date(conversation.updatedAt).toLocaleString('ru-RU')}</span></button>; })}</aside>
      {selected && <div className="flex min-h-[460px] flex-col lg:min-h-0"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><div className="min-w-0"><h2 className="truncate font-black text-navy">{selected.contact?.name || `Клиент ${selected.id.slice(-5)}`}</h2><p className="text-xs font-bold text-brand-dark">{selected.contact?.subject}</p><p className={`mt-1 text-xs font-semibold ${selected.status === 'pending_close' ? 'text-amber-600' : 'text-slate-400'}`}>{selected.status === 'open' ? 'Открытый диалог' : selected.status === 'pending_close' ? 'Ожидает подтверждения клиента' : 'Диалог закрыт'}</p>{selected.contact && <p className="mt-1 break-all text-[11px] text-slate-500">{selected.contact.phone} · {selected.contact.email}</p>}</div><div className="flex gap-2"><button onClick={() => toggleConversationStatus(selected.id)} className="flex items-center gap-2 rounded-xl bg-mist px-3 py-2 text-xs font-black text-brand-dark"><CheckCircle2 className="size-4"/>{selected.status === 'open' ? 'Предложить закрыть' : 'Открыть снова'}</button><button onClick={() => { if (window.confirm('Удалить этот диалог?')) { deleteConversation(selected.id); setSelectedId(null); } }} className="grid size-9 place-items-center rounded-xl bg-red-50 text-red-500" aria-label="Удалить диалог"><Trash2 className="size-4"/></button></div></header>
        <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 sm:p-6">{selected.messages.map(message => message.role === 'system' ? <p key={message.id} className="mx-auto max-w-md text-center text-xs text-slate-400">{message.text}</p> : <div key={message.id} className={`flex ${message.role === 'manager' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'manager' ? 'rounded-br-sm bg-brand text-white' : 'rounded-bl-sm bg-white text-slate-600 shadow-sm'}`}>{message.text}<p className={`mt-1 text-right text-[10px] ${message.role === 'manager' ? 'text-white/60' : 'text-slate-400'}`}>{new Date(message.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p></div></div>)}{selected.userTyping && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-semibold text-slate-500 shadow-sm">Клиент печатает <span className="flex gap-1">{[0,1,2].map(index => <span key={index} className="size-1.5 animate-bounce rounded-full bg-brand" style={{ animationDelay: `${index * 120}ms` }}/>)}</span></div></div>}</div>
        {error && <p className="bg-red-50 px-4 py-2 text-center text-xs font-bold text-red-600">{error}</p>}
        <form onSubmit={submit} className="flex gap-2 border-t border-slate-100 p-4"><input value={reply} onChange={event => setReply(event.target.value)} placeholder="Ответ менеджера…" className="h-12 min-w-0 flex-1 rounded-xl bg-slate-100 px-4 text-sm outline-none focus:ring-4 focus:ring-brand/10"/><button disabled={!reply.trim()} className="grid size-12 place-items-center rounded-xl bg-brand text-white disabled:opacity-40" aria-label="Отправить ответ"><Send className="size-5"/></button></form>
      </div>}
    </div>}
  </section>;
}
