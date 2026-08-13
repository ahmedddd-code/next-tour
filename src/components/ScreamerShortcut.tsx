import { useEffect } from 'react';

export function ScreamerShortcut() {
  useEffect(() => {
    function openScreamer(event: KeyboardEvent) {
      if (event.key === 'F9' && event.shiftKey) {
        event.preventDefault();
        window.open('/screamer', '_blank', 'noopener,noreferrer');
      }
    }
    window.addEventListener('keydown', openScreamer);
    return () => window.removeEventListener('keydown', openScreamer);
  }, []);
  return null;
}
