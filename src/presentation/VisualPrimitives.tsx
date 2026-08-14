import { Check, ChevronRight, MapPin, Plane, Search, Star } from 'lucide-react';

export function MiniSearch() {
  return <div className="p-search"><div><small>Откуда</small><b><MapPin/> Алматы</b></div><div><small>Куда</small><b>Анталья, Турция</b></div><div><small>Даты</small><b>12–19 сентября</b></div><button><Search/> Найти тур</button></div>;
}

export function TourCard({ country = 'Турция', price = '382 000 ₸' }: { country?: string; price?: string }) {
  return <div className="p-tour-card"><div className="p-tour-photo"><span>−18%</span></div><div className="p-tour-info"><small>{country} · 7 ночей</small><b>Rixos Premium Belek</b><span className="p-stars"><Star/><Star/><Star/><Star/><Star/></span><div><strong>{price}</strong><button><ChevronRight/></button></div></div></div>;
}

export function CheckList({ items }: { items: string[] }) {
  return <div className="p-checks">{items.map(item => <div key={item}><span><Check/></span>{item}</div>)}</div>;
}

export function PlaneRoute() {
  return <div className="p-route" aria-hidden="true"><i/><Plane/><i/></div>;
}
