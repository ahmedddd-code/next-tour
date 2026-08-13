import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollManager() {
  const location = useLocation();

  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual';
    const state = location.state as { scrollTo?: string } | null;
    const targetId = state?.scrollTo ?? location.hash.replace(/^#/, '');
    if (!targetId) { window.scrollTo({ top: 0, behavior: 'instant' }); return; }

    let cancelled = false;
    let attempts = 0;
    const scrollWhenReady = () => {
      if (cancelled) return;
      const target = document.getElementById(targetId);
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      attempts += 1;
      if (attempts < 40) window.setTimeout(scrollWhenReady, 25);
    };
    scrollWhenReady();
    return () => { cancelled = true; };
  }, [location.key, location.pathname, location.search, location.hash, location.state]);

  return null;
}
