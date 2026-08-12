import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'nexttour:reviews:v1';
export type NextTourReview = { id: string; name: string; rating: number; text: string; createdAt: string; status: 'pending' | 'published' };
type NewReview = Pick<NextTourReview, 'name' | 'rating' | 'text'>;
type ContextValue = { reviews: NextTourReview[]; addReview: (review: NewReview) => void; publishReview: (id: string) => void; deleteReview: (id: string) => void };

const defaults: NextTourReview[] = [
  { id: 'review-anna', name: 'Анна и Михаил', rating: 5, text: 'Менеджер услышала всё, что было важно. Это был наш лучший отпуск.', createdAt: '2026-05-20T10:00:00.000Z', status: 'published' },
  { id: 'review-orlov', name: 'Семья Орловых', rating: 5, text: 'Летали с двумя детьми и впервые вообще ни о чём не переживали.', createdAt: '2026-06-18T10:00:00.000Z', status: 'published' },
];
const ReviewsContext = createContext<ContextValue | null>(null);

function loadReviews() {
  try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) as NextTourReview[] : defaults; }
  catch { return defaults; }
}

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<NextTourReview[]>(loadReviews);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews)); }, [reviews]);
  const value = useMemo<ContextValue>(() => ({
    reviews,
    addReview: review => setReviews(current => [{ ...review, id: `review-${crypto.randomUUID()}`, createdAt: new Date().toISOString(), status: 'pending' }, ...current]),
    publishReview: id => setReviews(current => current.map(review => review.id === id ? { ...review, status: 'published' } : review)),
    deleteReview: id => setReviews(current => current.filter(review => review.id !== id)),
  }), [reviews]);
  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) throw new Error('useReviews должен использоваться внутри ReviewsProvider');
  return context;
}
