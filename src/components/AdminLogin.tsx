import { Eye, EyeOff, LockKeyhole, LogIn } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Logo } from './Logo';
import { loginAdmin } from '../lib/adminSession';

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true); setError('');
    try { await loginAdmin(password); onSuccess(); }
    catch { setError('Неверный пароль. Попробуйте ещё раз.'); }
    finally { setSubmitting(false); }
  }

  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,rgba(0,200,83,.18),transparent_32%),linear-gradient(135deg,#071d34,#0d3152)] p-4">
    <section className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
      <div className="flex justify-center"><Logo/></div>
      <div className="mt-7 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand-dark"><LockKeyhole className="size-7"/></span><h1 className="mt-4 text-2xl font-black text-navy">Вход в админ-панель</h1><p className="mt-2 text-sm text-slate-500">Введите пароль администратора Next Tour</p></div>
      <form onSubmit={submit} className="mt-7"><label><span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Пароль</span><div className="relative"><input autoFocus required type={showPassword ? 'text' : 'password'} value={password} onChange={event => { setPassword(event.target.value); setError(''); }} placeholder="Введите пароль" className="h-13 w-full rounded-2xl border border-slate-200 px-4 pr-12 font-semibold text-navy outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"/><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-navy" aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>{showPassword ? <EyeOff className="size-5"/> : <Eye className="size-5"/>}</button></div></label>
        {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>}
        <button disabled={submitting} className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand font-extrabold text-white transition hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/20 disabled:opacity-60"><LogIn className="size-5"/>{submitting ? 'Проверяем…' : 'Войти'}</button>
      </form>
    </section>
  </main>;
}
