import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface PromoVideoModalProps {
  onClose: () => void;
}

export function PromoVideoModal({ onClose }: PromoVideoModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center bg-navy/90 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Рекламный ролик NextTour" onMouseDown={event => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-black/55 text-white transition hover:bg-black/80" aria-label="Закрыть видео">
          <X className="size-5"/>
        </button>
        <video autoPlay controls playsInline preload="auto" poster="/images/promo/tropical-resort.png" className="block aspect-video w-full">
          <source src="/videos/nexttour-promo.mp4" type="video/mp4"/>
          Ваш браузер не поддерживает видео.
        </video>
      </div>
    </div>,
    document.body,
  );
}
