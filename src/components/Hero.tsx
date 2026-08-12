import { ArrowRight, Bot, Check, Play } from 'lucide-react';
import { Header } from './Header';

export function Hero() {
  return (
    <section id="top" className="relative min-h-[760px] overflow-hidden bg-navy text-white md:min-h-[820px]">
      <img src="/images/nexttour-hero.png" alt="Тропический курорт с лазурной лагуной" className="absolute inset-0 size-full object-cover object-[68%_center]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,20,37,.9)_0%,rgba(3,20,37,.64)_42%,rgba(3,20,37,.08)_78%),linear-gradient(0deg,rgba(3,20,37,.35),transparent_55%)]" />
      <Header />
      <div className="section-shell relative z-10 flex min-h-[760px] items-center pt-24 md:min-h-[820px]">
        <div className="max-w-[700px] pb-32 pt-14 md:pb-40">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md">
            <span className="size-2 rounded-full bg-brand shadow-[0_0_0_5px_rgba(0,200,83,.18)]" /> Туры, которые хочется запомнить
          </div>
          <h1 className="max-w-[680px] text-[42px] font-black leading-[1.02] tracking-[-0.055em] sm:text-6xl md:text-[72px]">
            Подберём тур так, будто выбираем его <span className="text-brand">для себя</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg">Никаких бесконечных вкладок и сомнений. Расскажите, как хотите отдохнуть — мы найдём ваш идеальный вариант.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#search" className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 font-extrabold transition hover:bg-brand-dark">Подобрать тур <ArrowRight className="size-5 transition group-hover:translate-x-1" /></a>
            <a href="#ai" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-4 font-extrabold backdrop-blur-md transition hover:bg-white/20"><Bot className="size-5" /> Спросить AI</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
            {['Без скрытых доплат', 'Поддержка 24/7', 'Проверенные отели'].map(item => <span key={item} className="flex items-center gap-2"><Check className="size-4 text-brand" />{item}</span>)}
          </div>
        </div>
      </div>
      <button className="absolute bottom-36 right-[8%] z-10 hidden size-20 place-items-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition hover:scale-105 xl:grid" aria-label="Смотреть видео"><Play className="ml-1 size-7 fill-white" /></button>
    </section>
  );
}
