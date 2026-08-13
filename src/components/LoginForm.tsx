import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginForm({ onRegister }: { onRegister: () => void }) {
  const { login, resetPassword } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const inputClass = 'h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 text-sm font-semibold text-navy outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10';

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setNotice('');
    if (!identifier.trim() || password.length < 6) { setError('Введите телефон или Email и пароль.'); return; }
    setBusy(true); const message = await login(identifier, password); setBusy(false);
    if (message) setError(message);
  }

  async function forgotPassword() {
    setError(''); setNotice('');
    const message = await resetPassword(identifier);
    if (message) setError(message); else setNotice('Ссылка для восстановления отправлена на вашу почту.');
  }

  return <motion.form key="login" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} onSubmit={submit} noValidate className="space-y-4">
    <label className="block"><span className="mb-2 block text-xs font-extrabold text-slate-500">Телефон или Email</span><span className="relative block"><Mail className="absolute left-4 top-4 size-5 text-slate-400"/><input autoFocus value={identifier} onChange={event => setIdentifier(event.target.value)} placeholder="name@example.com или +7…" autoComplete="username" className={inputClass}/></span></label>
    <label className="block"><span className="mb-2 block text-xs font-extrabold text-slate-500">Пароль</span><span className="relative block"><LockKeyhole className="absolute left-4 top-4 size-5 text-slate-400"/><input type={passwordVisible ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="Введите пароль" autoComplete="current-password" className={`${inputClass} pr-12`}/><button type="button" onClick={() => setPasswordVisible(value => !value)} className="absolute right-3 top-3 grid size-8 place-items-center text-slate-400" aria-label="Показать пароль">{passwordVisible ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}</button></span></label>
    <div className="flex justify-end"><button type="button" onClick={forgotPassword} className="text-xs font-extrabold text-brand-dark hover:underline">Забыли пароль?</button></div>
    {error && <motion.p initial={{ x: -5 }} animate={{ x: [-5, 5, -4, 4, 0] }} className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">{error}</motion.p>}
    {notice && <p className="rounded-xl bg-brand/10 p-3 text-xs font-bold text-brand-dark">{notice}</p>}
    <button disabled={busy} className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-emerald-600 font-black text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60">{busy && <LoaderCircle className="size-4 animate-spin"/>}{busy ? 'Входим…' : 'Войти'}</button>
    <p className="text-center text-sm text-slate-500">Нет аккаунта? <button type="button" onClick={onRegister} className="font-black text-brand-dark hover:underline">Зарегистрироваться</button></p>
  </motion.form>;
}
