import { CheckCircle2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ResetPasswordForm } from './ResetPasswordForm';

export function AuthModal() {
  const { modalOpen, authTab, setAuthTab, closeAuth, registrationSuccess, passwordRecovery } = useAuth();
  useEffect(() => {
    if (!modalOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') closeAuth(); };
    document.addEventListener('keydown', close);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', close); };
  }, [modalOpen, closeAuth]);

  return <>
    <AnimatePresence>{modalOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) closeAuth(); }} className="fixed inset-0 z-[11000] grid place-items-center overflow-y-auto bg-navy/75 p-3 backdrop-blur-md sm:p-6">
      <motion.section initial={{ opacity: 0, scale: .95, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .97, y: 8 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }} role="dialog" aria-modal="true" aria-label="Вход в Next Tour" className="my-auto grid w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(0,0,0,.35)] lg:grid-cols-[.8fr_1.2fr]">
        <aside className="relative hidden overflow-hidden bg-navy p-9 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-24 -top-20 size-72 rounded-full bg-brand/20 blur-3xl"/><div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black"><Sparkles className="size-4 text-brand"/>NEXT TOUR PRIVILEGE</span><h2 className="mt-8 text-4xl font-black leading-tight tracking-[-.045em]">Ваше путешествие начинается здесь</h2><p className="mt-4 leading-7 text-white/60">Сохраняйте заявки, получайте помощь менеджера и возвращайтесь к выбранным турам с любого устройства.</p></div><div className="space-y-3 text-sm font-bold text-white/80"><p className="flex items-center gap-2"><ShieldCheck className="size-5 text-brand"/>Защищённая авторизация</p><p className="flex items-center gap-2"><CheckCircle2 className="size-5 text-brand"/>Данные заполняются автоматически</p></div></aside>
        <div className="relative max-h-[92vh] overflow-y-auto p-5 sm:p-8"><button onClick={closeAuth} className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-navy" aria-label="Закрыть"><X className="size-5"/></button><p className="text-xs font-black uppercase tracking-[.18em] text-brand-dark">Next Tour</p><h2 className="mt-2 pr-12 text-3xl font-black tracking-[-.04em] text-navy">{passwordRecovery ? 'Новый пароль' : authTab === 'login' ? 'С возвращением' : 'Создайте аккаунт'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{passwordRecovery ? 'Придумайте новый надёжный пароль для аккаунта.' : authTab === 'login' ? 'Войдите, чтобы продолжить оформление тура.' : 'Один аккаунт — все ваши путешествия и заявки.'}</p>
          {!passwordRecovery && <div className="my-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1"><button onClick={() => setAuthTab('login')} className={`rounded-xl px-4 py-3 text-sm font-black transition ${authTab === 'login' ? 'bg-white text-navy shadow-sm' : 'text-slate-400'}`}>Войти</button><button onClick={() => setAuthTab('register')} className={`rounded-xl px-4 py-3 text-sm font-black transition ${authTab === 'register' ? 'bg-white text-navy shadow-sm' : 'text-slate-400'}`}>Регистрация</button></div>}
          <div className={passwordRecovery ? 'mt-6' : ''}>{passwordRecovery ? <ResetPasswordForm/> : authTab === 'login' ? <LoginForm onRegister={() => setAuthTab('register')}/> : <RegisterForm onLogin={() => setAuthTab('login')}/>}</div>
        </div>
      </motion.section>
    </motion.div>}</AnimatePresence>
    <AnimatePresence>{registrationSuccess && <motion.div initial={{ opacity: 0, y: -20, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} className="fixed left-1/2 top-5 z-[12000] flex w-[min(92vw,520px)] -translate-x-1/2 items-start gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand/10"><CheckCircle2 className="size-6 text-brand-dark"/></span><span><strong className="block text-sm text-navy">Аккаунт успешно создан!</strong><span className="mt-1 block text-xs leading-5 text-slate-500">Добро пожаловать в Next Tour. Теперь вы можете бронировать туры и отслеживать свои заявки.</span></span></motion.div>}</AnimatePresence>
  </>;
}
