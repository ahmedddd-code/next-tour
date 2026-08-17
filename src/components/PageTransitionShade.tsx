import { useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function PageTransitionShade() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  useLayoutEffect(() => {
    setVisible(true);
    const firstFrame = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(false)));
    return () => cancelAnimationFrame(firstFrame);
  }, [location.key, location.pathname, location.search, location.hash]);
  return <div aria-hidden="true" className={`pointer-events-none fixed inset-0 z-[14000] bg-navy transition-opacity duration-300 ${visible ? 'opacity-20' : 'opacity-0'}`}/>;
}
