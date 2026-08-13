import { useEffect } from 'react';

export function useAutoRefresh(load: () => Promise<void>, interval: () => number) {
  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    let refreshing = false;

    const schedule = () => {
      if (active) timer = window.setTimeout(refresh, interval());
    };
    const refresh = async () => {
      if (refreshing) return;
      refreshing = true;
      try {
        if (document.visibilityState === 'visible') await load();
      } finally {
        refreshing = false;
        schedule();
      }
    };
    const refreshNow = () => {
      if (document.visibilityState !== 'visible') return;
      if (timer) window.clearTimeout(timer);
      void refresh();
    };

    void refresh();
    window.addEventListener('online', refreshNow);
    document.addEventListener('visibilitychange', refreshNow);
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
      window.removeEventListener('online', refreshNow);
      document.removeEventListener('visibilitychange', refreshNow);
    };
  }, [load, interval]);
}
