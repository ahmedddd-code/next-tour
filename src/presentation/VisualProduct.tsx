import { Bell, Bot, CalendarDays, Check, ChevronRight, Heart, Home, MapPin, Search, Send, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MiniSearch, TourCard } from './VisualPrimitives';
import type { VisualKind } from './types';

const filters = ['Турция', 'Анталья', '12 сен', '7 ночей', 'Всё включено', 'до 450 000 ₸', '5 звёзд', 'Все операторы'];

function HomeVisual() { return <div className="p-browser"><div className="p-browser-bar"><i/><i/><i/><span>nexttour.kz</span></div><div className="p-browser-hero"><div className="p-mini-brand">next<span>tour</span></div><h3>Ваше следующее<br/>путешествие</h3><MiniSearch/></div><div className="p-destinations"><div/><div/><div/></div></div>; }
function SearchVisual() { return <div className="p-search-scene"><div className="p-filter-list">{filters.map((f, i) => <span className={i === 0 || i === 5 ? 'active' : ''} key={f}>{f}<ChevronRight/></span>)}</div><div className="p-results"><div><b>128 туров</b><small>Сначала дешевле</small></div><TourCard/><TourCard country="Египет" price="419 000 ₸"/></div></div>; }
function BookingVisual() { const steps=['Тур','Вход','Туристы','Заявка','Менеджер','Статус']; return <div className="p-steps">{steps.map((step,i)=><div key={step} className={i < 4 ? 'done' : ''}><span>{i < 4 ? <Check/> : i+1}</span><b>{step}</b><small>{i < 4 ? 'готово' : 'следующий шаг'}</small></div>)}</div>; }
function AccountVisual() { const menu: Array<[LucideIcon,string]>=[[Home,'Обзор'],[Heart,'Избранное'],[CalendarDays,'Поездки'],[Bell,'Уведомления']]; return <div className="p-account"><aside><div className="p-avatar">AK</div><b>Алина К.</b><small>Алматы · 1 250 бонусов</small>{menu.map(([Icon,label])=><button key={label}><Icon/>{label}</button>)}</aside><main><small>БЛИЖАЙШАЯ ПОЕЗДКА</small><h3>Анталья</h3><p><MapPin/> Rixos Premium Belek</p><div className="p-ticket"><span>ALA</span><i/><span>AYT</span></div><b>12 сентября · 7 ночей</b></main></div>; }
function AiVisual() { return <div className="p-chat"><div className="p-chat-head"><span><Bot/></span><div><b>Next AI</b><small>онлайн · отвечает мгновенно</small></div></div><div className="p-bubble user">Хочу тёплое море до 450 000 ₸ на двоих в сентябре</div><div className="p-bubble ai">Нашёл 46 вариантов. Лучшее совпадение — Анталья: 7 ночей, всё включено.</div><div className="p-ai-cards"><span>🇹🇷 Турция <b>от 382 000 ₸</b></span><span>🇪🇬 Египет <b>от 419 000 ₸</b></span><span>🇦🇪 ОАЭ <b>от 438 000 ₸</b></span></div><div className="p-chat-input">Спросите о путешествии…<Send/></div></div>; }
function MobileVisual() { return <div className="p-phones"><div className="p-phone back"><i/><div className="p-phone-map"><MapPin/></div><div className="p-bottom-nav"><Home/><Search/><Heart/><UserRound/></div></div><div className="p-phone"><i/><small>Доброе утро, Алина</small><h3>Куда полетим?</h3><div className="p-phone-search"><Search/> Найти направление</div><div className="p-phone-photo"/><b>Горящие предложения</b><div className="p-phone-deal"><span>Анталья</span><b>382 000 ₸</b></div><div className="p-bottom-nav"><Home/><Search/><Heart/><UserRound/></div></div></div>; }

export function ProductVisual({ kind }: { kind: VisualKind }) {
  if (kind === 'home') return <HomeVisual/>;
  if (kind === 'search') return <SearchVisual/>;
  if (kind === 'booking') return <BookingVisual/>;
  if (kind === 'account') return <AccountVisual/>;
  if (kind === 'ai') return <AiVisual/>;
  return <MobileVisual/>;
}
