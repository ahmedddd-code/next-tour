import { useState } from 'react';
import { ArrowRight, Bot, Check, Play } from 'lucide-react';
import { Header } from './Header';
import { PromoVideoModal } from './PromoVideoModal';
import { SectionLink } from './SectionLink';
import { optimizedImageSrcSet, optimizedImageUrl, realTravelHeroImage, showTravelImageFallback } from '../utils/image';

export function Hero() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section id="top" className="hero-frame relative overflow-hidden bg-navy text-white">
      <img src={optimizedImageUrl(realTravelHeroImage, 2000, 88)} srcSet={optimizedImageSrcSet(realTravelHeroImage, [960, 1400, 2000])} sizes="100vw" alt="Настоящий тропический пляж с лазурным морем" fetchPriority="high" decoding="async" onError={showTravelImageFallback} className="absolute inset-0 size-full object-cover object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,20,37,.9)_0%,rgba(3,20,37,.64)_42%,rgba(3,20,37,.08)_78%),linear-gradient(0deg,rgba(3,20,37,.35),transparent_55%)]" />
      <Header />
      <div className="hero-frame section-shell relative z-10 flex items-center pt-24 2xl:pt-28">
        <div className="max-w-[740px] pb-32 pt-14 md:pb-40 2xl:max-w-[820px]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md">
            <span className="size-2 rounded-full bg-brand shadow-[0_0_0_5px_rgba(0,200,83,.18)]" /> Туры, которые хочется запомнить
          </div>
          <h1 className="max-w-[760px] text-[clamp(2.6rem,5vw,5.25rem)] font-black leading-[1.02] tracking-[-0.055em]">
            Подберём тур так, будто выбираем его <span className="text-brand">для себя</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg 2xl:text-xl 2xl:leading-8">Никаких бесконечных вкладок и сомнений. Расскажите, как хотите отдохнуть — мы найдём ваш идеальный вариант.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <SectionLink section="search" className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 font-extrabold transition hover:bg-brand-dark">Подобрать тур <ArrowRight className="size-5 transition group-hover:translate-x-1" /></SectionLink>
            <SectionLink section="ai" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-4 font-extrabold backdrop-blur-md transition hover:bg-white/20"><Bot className="size-5" /> Спросить AI</SectionLink>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
            {['Без скрытых доплат', 'Поддержка 24/7', 'Проверенные отели'].map(item => <span key={item} className="flex items-center gap-2"><Check className="size-4 text-brand" />{item}</span>)}
          </div>
        </div>
      </div>
      <button onClick={() => setVideoOpen(true)} className="absolute bottom-36 right-[8%] z-10 hidden size-20 place-items-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition hover:scale-105 xl:grid" aria-label="Смотреть видео о NextTour" aria-expanded={videoOpen}><Play className="ml-1 size-7 fill-white" /></button>
      {videoOpen && <PromoVideoModal onClose={() => setVideoOpen(false)}/>}
    </section>
  );
}
