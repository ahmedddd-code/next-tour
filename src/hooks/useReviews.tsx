import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ADMIN_PASSWORD, invokeSiteData } from '../lib/siteData';

export type NextTourReview = { id: string; name: string; rating: number; text: string; createdAt: string; status: 'pending' | 'published' };
type NewReview = Pick<NextTourReview, 'name' | 'rating' | 'text'>;
type ContextValue = { reviews: NextTourReview[]; addReview: (review: NewReview) => Promise<void>; publishReview: (id: string) => Promise<void>; deleteReview: (id: string) => Promise<void> };
const ReviewsContext = createContext<ContextValue | null>(null);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<NextTourReview[]>([]);
  const load = useCallback(async () => {
    try {
      const admin = sessionStorage.getItem('nexttour:admin-authenticated') === 'true';
      const data = await invokeSiteData({ action: admin ? 'admin_list_reviews' : 'list_reviews', ...(admin ? { adminPassword: ADMIN_PASSWORD } : {}) });
      setReviews((data.reviews as NextTourReview[]) ?? []);
    } catch { /* Повторим автоматически. */ }
  }, []);
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 3500); return () => window.clearInterval(timer); }, [load]);
  const value = useMemo<ContextValue>(() => ({
    reviews,
    addReview: async review => { await invokeSiteData({ action: 'create_review', ...review }); await load(); },
    publishReview: async id => { await invokeSiteData({ action: 'admin_publish_review', adminPassword: ADMIN_PASSWORD, id }); await load(); },
    deleteReview: async id => { await invokeSiteData({ action: 'admin_delete_review', adminPassword: ADMIN_PASSWORD, id }); await load(); },
  }), [reviews, load]);
  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}
export function useReviews() { const context = useContext(ReviewsContext); if (!context) throw new Error('useReviews должен использоваться внутри ReviewsProvider'); return context; }
