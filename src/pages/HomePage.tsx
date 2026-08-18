import { AiAssistant } from '../components/AiAssistant';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { Reviews } from '../components/Reviews';
import { TourSearch } from '../components/TourSearch';
import { TourSections } from '../components/TourSections';
import { TrustSection } from '../components/TrustSection';
import { ReviewsProvider } from '../hooks/useReviews';

export function HomePage() {
  return <ReviewsProvider><HomeContent/></ReviewsProvider>;
}

function HomeContent() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <TourSearch />
      <TourSections />
      <TrustSection />
      <AiAssistant />
      <Reviews />
      <Footer />
    </main>
  );
}
