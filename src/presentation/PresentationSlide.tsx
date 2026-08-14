import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CheckList } from './VisualPrimitives';
import { SlideVisual } from './SlideVisual';
import type { Slide } from './types';

export function PresentationSlide({ slide, index, onNext, onClose }: { slide: Slide; index: number; onNext: () => void; onClose: () => void }) {
  const Icon = slide.icon;
  const cover = slide.visual === 'cover' || slide.visual === 'final';
  return <motion.section className={`p-slide ${cover ? 'p-slide-cover' : ''}`} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24, scale: .985 }} transition={{ duration: .5, ease: [0.22,1,0.36,1] }}>
    <div className="p-copy">
      <motion.div className="p-eyebrow" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.08}}>{Icon && <Icon/>}{slide.eyebrow}</motion.div>
      <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:.14}}>{slide.title}</motion.h1>
      <motion.p className="p-lead" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.22}}>{slide.lead}</motion.p>
      {slide.points && <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.3}}><CheckList items={slide.points}/></motion.div>}
      {slide.metric && <motion.div className="p-metric" initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} transition={{delay:.34}}><b>{slide.metric}</b><span>{slide.metricLabel}</span></motion.div>}
      {index === 0 && <button className="p-primary" onClick={onNext}>Начать презентацию <ArrowRight/></button>}
      {slide.visual === 'final' && <button className="p-primary" onClick={onClose}>Вернуться на сайт <ArrowRight/></button>}
    </div>
    <motion.div className="p-visual" initial={{opacity:0,x:50,scale:.96}} animate={{opacity:1,x:0,scale:1}} transition={{delay:.2,duration:.65,ease:[.22,1,.36,1]}}><SlideVisual kind={slide.visual}/></motion.div>
  </motion.section>;
}
