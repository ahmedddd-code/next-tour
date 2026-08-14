import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PresentationSlide } from './PresentationSlide';
import { slides } from './slides';
import './presentation.css';

export function PresentationOverlay({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchX = useRef<number | null>(null);
  const go = useCallback((next: number) => {
    const safe = Math.max(0, Math.min(slides.length - 1, next));
    setDirection(safe >= index ? 1 : -1);
    setIndex(safe);
  }, [index]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') { event.preventDefault(); go(index + 1); }
      else if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); go(index - 1); }
      else if (event.key === 'Home') { event.preventDefault(); go(0); }
      else if (event.key === 'End') { event.preventDefault(); go(slides.length - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [go, index, onClose]);

  return createPortal(<motion.div className="presentation" role="dialog" aria-modal="true" aria-label="Презентация Next Tour" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    <div className="p-ambient"/><div className="p-grid"/>
    <header className="p-topbar"><div className="p-brand"><span>next</span>tour<i/></div><div className="p-top-actions"><button onClick={() => document.documentElement.requestFullscreen?.()} title="На весь экран"><Maximize2/></button><button onClick={onClose} title="Закрыть презентацию"><X/></button></div></header>
    <main onTouchStart={e => touchX.current=e.touches[0].clientX} onTouchEnd={e => { if(touchX.current===null)return; const dx=e.changedTouches[0].clientX-touchX.current;if(Math.abs(dx)>45)go(index+(dx<0?1:-1));touchX.current=null; }}>
      <AnimatePresence mode="wait" custom={direction}><PresentationSlide key={index} slide={slides[index]} index={index} onNext={() => go(index+1)} onClose={onClose}/></AnimatePresence>
    </main>
    <footer className="p-footer"><span className="p-counter">{String(index+1).padStart(2,'0')} <i/> {String(slides.length).padStart(2,'0')}</span><div className="p-progress" aria-label={`Слайд ${index+1} из ${slides.length}`}><i style={{width:`${((index+1)/slides.length)*100}%`}}/></div><div className="p-controls"><span>← → для навигации</span><button disabled={index===0} onClick={()=>go(index-1)}><ArrowLeft/></button><button disabled={index===slides.length-1} onClick={()=>go(index+1)}><ArrowRight/></button></div></footer>
    <div className="p-secret"><LockIcon/> Режим презентации Next Tour</div>
  </motion.div>, document.body);
}

function LockIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11V8a5 5 0 0110 0v3M5 11h14v10H5z"/></svg>; }
