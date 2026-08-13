import { useEffect } from 'react';

export function ScreamerShortcut() {
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (event.key === 'F9' && event.shiftKey) {
        event.preventDefault();
        window.open('/screamer', '_blank', 'noopener,noreferrer');
      }
      if (event.key === 'F7' && event.shiftKey) {
        event.preventDefault();
        window.location.assign('/admin');
      }
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);
  return null;
}
