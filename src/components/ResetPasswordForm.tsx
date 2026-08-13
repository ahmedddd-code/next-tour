import { Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

export function ResetPasswordForm() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inputClass = 'h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 text-sm font-semibold text-navy outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10';

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (password !== confirmation) { setError('Пароли не совпадают.'); return; }
    setBusy(true);
    const message = await updatePassword(password);
    setBusy(false);
    if (message) setError(message);
  }

  const field = (label: string, value: string, change: (value: string) => void, autoComplete: string) => <label className="block"><span className="mb-2 block text-xs font-extrabold text-slate-500">{label}</span><span className="relative block"><LockKeyhole className="absolute left-4 top-4 size-5 text-slate-400"/><input required minLength={8} type={visible ? 'text' : 'password'} value={value} onChange={event => change(event.target.value)} autoComplete={autoComplete} className={`${inputClass} pr-12`}/><button type="button" onClick={() => setVisible(current => !current)} className="absolute right-3 top-3 grid size-8 place-items-center text-slate-400" aria-label="Показать пароль">{visible ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}</button></span></label>;

  return <form onSubmit={submit} className="space-y-4">{field('Новый пароль', password, setPassword, 'new-password')}{field('Повторите пароль', confirmation, setConfirmation, 'new-password')}{error && <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">{error}</p>}<button disabled={busy} className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand font-black text-white disabled:opacity-60">{busy && <LoaderCircle className="size-4 animate-spin"/>}{busy ? 'Сохраняем…' : 'Сохранить новый пароль'}</button></form>;
}
