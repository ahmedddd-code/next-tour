import { lazy, Suspense, useEffect, useState } from 'react';

const PresentationOverlay = lazy(() => import('../presentation/PresentationOverlay').then(module => ({ default: module.PresentationOverlay })));

export function ScreamerShortcut() {
  const [presentationOpen, setPresentationOpen] = useState(false);
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const isPresentationShortcut = event.shiftKey
        && (event.key === 'F1' || event.code === 'F1' || event.keyCode === 112);

      if (isPresentationShortcut) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setPresentationOpen(true);
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')) return;
      if (event.key === 'F9' && event.shiftKey) {
        event.preventDefault();
        window.open('/screamer', '_blank', 'noopener,noreferrer');
      }
      if (event.key === 'F7' && event.shiftKey) {
        event.preventDefault();
        window.location.assign('/admin');
      }
    }
    window.addEventListener('keydown', handleShortcut, { capture: true });
    return () => window.removeEventListener('keydown', handleShortcut, { capture: true });
  }, []);
  return presentationOpen ? <Suspense fallback={null}><PresentationOverlay onClose={() => setPresentationOpen(false)}/></Suspense> : null;
}
