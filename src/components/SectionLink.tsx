import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = { section: string; children: ReactNode; className?: string; onNavigate?: () => void };

const sectionRoutes: Record<string, string> = {
  search: '/search',
  hot: '/tours',
  destinations: '/destinations',
  ai: '/ai',
  reviews: '/reviews',
  contacts: '/contacts',
};

export function SectionLink({ section, children, className, onNavigate }: Props) {
  return <Link to={sectionRoutes[section] ?? '/'} onClick={onNavigate} className={className}>{children}</Link>;
}
