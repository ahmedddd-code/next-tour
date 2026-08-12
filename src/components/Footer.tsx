import { Camera, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer() {
  return <footer id="contacts" className="scroll-mt-24 bg-[#041629] text-white"><div className="section-shell py-16">
    <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_.8fr_1fr]">
      <div><Logo light/><p className="mt-5 max-w-xs text-sm leading-6 text-white/50">Путешествия, подобранные с вниманием к каждой детали. От идеи до возвращения домой.</p><div className="mt-6 flex gap-3"><a href="#" className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-brand" aria-label="Telegram"><Send className="size-4"/></a><a href="#" className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-brand" aria-label="Социальные сети"><Camera className="size-4"/></a></div></div>
      <div><h3 className="font-extrabold">Путешествия</h3><div className="mt-5 flex flex-col gap-3 text-sm text-white/50"><Link className="hover:text-white" to="/#hot">Горящие туры</Link><Link className="hover:text-white" to="/#destinations">Направления</Link><Link className="hover:text-white" to="/#ai">AI-подбор</Link></div></div>
      <div><h3 className="font-extrabold">Компания</h3><div className="mt-5 flex flex-col gap-3 text-sm text-white/50"><Link className="hover:text-white" to="/#reviews">Отзывы</Link><Link className="hover:text-white" to="/#contacts">Контакты</Link><Link className="hover:text-white" to="/">О нас</Link></div></div>
      <div><h3 className="font-extrabold">Связаться</h3><div className="mt-5 space-y-3 text-sm text-white/60"><a className="flex items-center gap-2 hover:text-white" href="tel:+77001234567"><Phone className="size-4 text-brand"/>+7 (700) 123-45-67</a><a className="flex items-center gap-2 hover:text-white" href="mailto:hello@nexttour.kz"><Mail className="size-4 text-brand"/>hello@nexttour.kz</a><p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-brand"/>Алматы, проспект Абая, 52</p></div></div>
    </div>
    <div className="flex flex-col gap-3 pt-7 text-xs text-white/35 sm:flex-row sm:justify-between"><p>© 2026 NEXTTOUR. Все права защищены.</p><p>С любовью к путешествиям и людям</p></div>
  </div></footer>;
}
