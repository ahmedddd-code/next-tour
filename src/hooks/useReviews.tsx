import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { invokeSiteData } from '../lib/siteData';
import { getAdminToken } from '../lib/adminSession';
import { useAutoRefresh } from './useAutoRefresh';

export type NextTourReview = { id: string; name: string; rating: number; text: string; createdAt: string; status: 'pending' | 'published' };
type NewReview = Pick<NextTourReview, 'name' | 'rating' | 'text'>;
type ContextValue = { reviews: NextTourReview[]; loaded: boolean; addReview: (review: NewReview) => Promise<void>; publishReview: (id: string) => Promise<void>; deleteReview: (id: string) => Promise<void> };
const ReviewsContext = createContext<ContextValue | null>(null);
const refreshInterval = () => getAdminToken() ? 5000 : 60000;

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<NextTourReview[]>([]);
  const [loaded, setLoaded] = useState(false);
  const load = useCallback(async () => {
    try {
      const admin = Boolean(getAdminToken());
      const data = await invokeSiteData({ action: admin ? 'admin_list_reviews' : 'list_reviews', ...(admin ? { adminToken: getAdminToken() } : {}) });
      const next = (data.reviews as NextTourReview[]) ?? [];
      setReviews(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
      setLoaded(true);
    } catch { /* Повторим автоматически. */ }
  }, []);
  useAutoRefresh(load, refreshInterval);
  const value = useMemo<ContextValue>(() => ({
    reviews, loaded,
    addReview: async review => { await invokeSiteData({ action: 'create_review', ...review }); await load(); },
    publishReview: async id => { await invokeSiteData({ action: 'admin_publish_review', adminToken: getAdminToken(), id }); await load(); },
    deleteReview: async id => { await invokeSiteData({ action: 'admin_delete_review', adminToken: getAdminToken(), id }); await load(); },
  }), [reviews, loaded, load]);
  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}
export function useReviews() { const context = useContext(ReviewsContext); if (!context) throw new Error('useReviews должен использоваться внутри ReviewsProvider'); return context; }
