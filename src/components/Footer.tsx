import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { SectionLink } from './SectionLink';

export function Footer() {
  return <footer id="contacts" className="scroll-mt-24 bg-[#041629] text-white"><div className="section-shell py-16">
    <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_.8fr_1fr]">
      <div><Logo light/><p className="mt-5 max-w-xs text-sm leading-6 text-white/50">Путешествия, подобранные с вниманием к каждой детали. От идеи до возвращения домой.</p><div className="mt-6 flex gap-3"><a href="https://t.me/+77071819912" target="_blank" rel="noreferrer" className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-brand" aria-label="Написать в Telegram"><Send className="size-4"/></a><a href="https://wa.me/77071819912" target="_blank" rel="noreferrer" className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-brand" aria-label="Написать в WhatsApp"><MessageCircle className="size-4"/></a></div></div>
      <div><h3 className="font-extrabold">Путешествия</h3><div className="mt-5 flex flex-col gap-3 text-sm text-white/50"><SectionLink className="hover:text-white" section="hot">Горящие туры</SectionLink><SectionLink className="hover:text-white" section="destinations">Направления</SectionLink><SectionLink className="hover:text-white" section="ai">AI-подбор</SectionLink></div></div>
      <div><h3 className="font-extrabold">Компания</h3><div className="mt-5 flex flex-col gap-3 text-sm text-white/50"><SectionLink className="hover:text-white" section="reviews">Отзывы</SectionLink><SectionLink className="hover:text-white" section="contacts">Контакты</SectionLink><Link className="hover:text-white" to="/">О нас</Link></div></div>
      <div><h3 className="font-extrabold">Связаться</h3><div className="mt-5 space-y-3 text-sm text-white/60"><a className="flex items-center gap-2 hover:text-white" href="tel:+77071819912"><Phone className="size-4 text-brand"/>+7 (707) 181-99-12</a><a className="flex items-center gap-2 hover:text-white" href="mailto:hello@nexttour.kz"><Mail className="size-4 text-brand"/>hello@nexttour.kz</a><p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-brand"/>Алматы, проспект Абая, 52</p></div></div>
    </div>
    <div className="flex flex-col gap-3 pt-7 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 NEXTTOUR. Все права защищены.</p><a href="tel:+77025643218" className="flex items-center gap-2 transition hover:text-white"><Phone className="size-3.5 text-brand"/>Техподдержка: +7 (702) 564-32-18</a><p>С любовью к путешествиям и людям</p></div>
  </div></footer>;
}
