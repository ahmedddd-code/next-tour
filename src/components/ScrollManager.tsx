import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollManager() {
  const location = useLocation();
  const initialLocationKey = useRef(location.key);

  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual';

    if (location.key === initialLocationKey.current) {
      if (location.hash) {
        window.history.replaceState(window.history.state, '', `${location.pathname}${location.search}`);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    if (location.hash) {
      requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView());
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.key, location.pathname, location.search, location.hash]);

  return null;
}
