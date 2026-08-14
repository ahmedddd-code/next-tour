import { lazy, Suspense, useEffect, useState } from 'react';

const PresentationOverlay = lazy(() => import('../presentation/PresentationOverlay').then(module => ({ default: module.PresentationOverlay })));

export function ScreamerShortcut() {
  const [presentationOpen, setPresentationOpen] = useState(false);
  useEffect(() => {
    const pressedKeys = new Set<string>();
    let gameOpened = false;

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

      pressedKeys.add(event.code);
      const hasModifier = event.ctrlKey || event.altKey || event.shiftKey || event.metaKey;
      const isGameShortcut = !hasModifier && pressedKeys.has('KeyA') && pressedKeys.has('Quote');
      if (isGameShortcut && !gameOpened) {
        event.preventDefault();
        gameOpened = true;
        window.open('/game', '_blank', 'noopener,noreferrer');
        return;
      }

      if (event.key === 'F9' && event.shiftKey) {
        event.preventDefault();
        window.open('/screamer', '_blank', 'noopener,noreferrer');
      }
      if (event.key === 'F7' && event.shiftKey) {
        event.preventDefault();
        window.location.assign('/admin');
      }
    }
    function handleKeyUp(event: KeyboardEvent) {
      pressedKeys.delete(event.code);
      if (!pressedKeys.has('KeyA') || !pressedKeys.has('Quote')) gameOpened = false;
    }
    function clearPressedKeys() {
      pressedKeys.clear();
      gameOpened = false;
    }
    window.addEventListener('keydown', handleShortcut, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    window.addEventListener('blur', clearPressedKeys);
    return () => {
      window.removeEventListener('keydown', handleShortcut, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      window.removeEventListener('blur', clearPressedKeys);
    };
  }, []);
  return presentationOpen ? <Suspense fallback={null}><PresentationOverlay onClose={() => setPresentationOpen(false)}/></Suspense> : null;
}
