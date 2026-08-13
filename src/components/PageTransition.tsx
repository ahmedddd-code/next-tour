import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const start = (event: TouchEvent) => { const touch = event.touches[0]; if (touch.clientX < 28) touchStart.current = { x: touch.clientX, y: touch.clientY }; };
    const end = (event: TouchEvent) => {
      if (!touchStart.current) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = Math.abs(touch.clientY - touchStart.current.y);
      touchStart.current = null;
      if (dx > 90 && dy < 70) window.history.back();
    };
    document.addEventListener('touchstart', start, { passive: true });
    document.addEventListener('touchend', end, { passive: true });
    return () => { document.removeEventListener('touchstart', start); document.removeEventListener('touchend', end); };
  }, []);

  return <div key={location.key} className={`min-h-screen will-change-transform ${navigationType === 'POP' ? 'animate-page-back' : 'animate-page-forward'}`}>{children}</div>;
}
