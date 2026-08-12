import { Link } from 'react-router-dom';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center" aria-label="NEXT TOUR — на главную">
      <img
        src="/images/nexttour-logo.jpg"
        alt="NEXT TOUR"
        className={`size-14 rounded-2xl object-cover shadow-lg ${light ? 'ring-1 ring-white/25' : 'ring-1 ring-navy/10'}`}
      />
    </Link>
  );
}
