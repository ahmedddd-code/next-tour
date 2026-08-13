import { type MouseEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type Props = { section: string; children: ReactNode; className?: string; onNavigate?: () => void };

export function SectionLink({ section, children, className, onNavigate }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  function openSection(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onNavigate?.();
    if (location.pathname === '/') {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate('/', { state: { scrollTo: section } });
  }

  return <a href={`/#${section}`} onClick={openSection} className={className}>{children}</a>;
}
