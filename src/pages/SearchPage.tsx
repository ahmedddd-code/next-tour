import { Footer } from '../components/Footer';
import { PageHeader } from '../components/PageHeader';
import { TourSearch } from '../components/TourSearch';

export function SearchPage() {
  return <main className="min-h-screen bg-mist"><PageHeader eyebrow="Начните путешествие" title="Подобрать тур"/><TourSearch/><div className="h-20 sm:h-28"/><Footer/></main>;
}
