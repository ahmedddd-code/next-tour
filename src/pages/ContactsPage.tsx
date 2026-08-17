import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { Footer } from '../components/Footer';
import { PageHeader } from '../components/PageHeader';

export function ContactsPage() {
  return <main className="min-h-screen bg-mist"><PageHeader eyebrow="Мы всегда на связи" title="Контакты"/><section className="section-shell py-14 sm:py-20"><div className="grid gap-4 md:grid-cols-3">
    <a href="tel:+77071819912" className="rounded-3xl bg-white p-6 shadow-sm"><Phone className="size-7 text-brand"/><h2 className="mt-5 text-lg font-black">Телефон</h2><p className="mt-2 text-slate-500">+7 (707) 181-99-12</p></a>
    <a href="mailto:hello@nexttour.kz" className="rounded-3xl bg-white p-6 shadow-sm"><Mail className="size-7 text-brand"/><h2 className="mt-5 text-lg font-black">Email</h2><p className="mt-2 break-all text-slate-500">hello@nexttour.kz</p></a>
    <div className="rounded-3xl bg-white p-6 shadow-sm"><MapPin className="size-7 text-brand"/><h2 className="mt-5 text-lg font-black">Офис</h2><p className="mt-2 text-slate-500">Алматы, проспект Абая, 52</p></div>
  </div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><a href="https://wa.me/77071819912" target="_blank" rel="noreferrer" className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 font-black text-white"><MessageCircle className="size-5"/>WhatsApp</a><a href="https://t.me/+77071819912" target="_blank" rel="noreferrer" className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 font-black text-white"><Send className="size-5"/>Telegram</a></div></section><Footer/></main>;
}
