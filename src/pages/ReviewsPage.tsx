import { Footer } from '../components/Footer';
import { PageHeader } from '../components/PageHeader';
import { Reviews } from '../components/Reviews';
import { ReviewsProvider } from '../hooks/useReviews';

export function ReviewsPage() {
  return <ReviewsProvider><main className="min-h-screen"><PageHeader eyebrow="Опыт путешественников" title="Отзывы"/><Reviews/><Footer/></main></ReviewsProvider>;
}
