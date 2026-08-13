import { LoaderCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { kazakhstanCities } from '../data/kazakhstanCities';
import { useAuth } from '../hooks/useAuth';
import { extractPhoneDigits, formatPhone } from '../utils/phone';

type Errors = Partial<Record<'firstName' | 'lastName' | 'phone' | 'email' | 'birthDate' | 'city' | 'password' | 'confirmPassword' | 'consent' | 'submit', string>>;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputClass = 'h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-navy outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10';

function FieldError({ text }: { text?: string }) {
  return text ? <motion.span initial={{ x: -4 }} animate={{ x: [-4, 4, -3, 3, 0] }} className="mt-1 block text-[11px] font-bold text-red-500">{text}</motion.span> : null;
}

export function RegisterForm({ onLogin }: { onLogin: () => void }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', middleName: '', phone: '', email: '', birthDate: '', city: '', password: '', confirmPassword: '', consent: false });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const update = <Key extends keyof typeof form>(key: Key, value: typeof form[Key]) => { setForm(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined, submit: undefined })); };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (form.firstName.trim().length < 2) next.firstName = 'Укажите имя.';
    if (form.lastName.trim().length < 2) next.lastName = 'Укажите фамилию.';
    if (extractPhoneDigits(form.phone).length !== 10) next.phone = 'Введите 10 цифр после +7.';
    if (!emailPattern.test(form.email)) next.email = 'Проверьте адрес электронной почты.';
    if (!form.birthDate) next.birthDate = 'Укажите дату рождения.';
    if (!form.city) next.city = 'Выберите город.';
    if (form.password.length < 8) next.password = 'Минимум 8 символов.';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Пароли не совпадают.';
    if (!form.consent) next.consent = 'Необходимо согласие на обработку данных.';
    if (Object.keys(next).length) { setErrors(next); return; }
    setBusy(true);
    const message = await register({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), middleName: form.middleName.trim(), phone: form.phone, email: form.email.trim().toLowerCase(), birthDate: form.birthDate, city: form.city, password: form.password });
    setBusy(false); if (message) setErrors({ submit: message });
  }

  return <motion.form key="register" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2">
    <label><span className="mb-1.5 block text-xs font-extrabold text-slate-500">Имя *</span><input autoFocus value={form.firstName} onChange={event => update('firstName', event.target.value)} className={inputClass}/><FieldError text={errors.firstName}/></label>
    <label><span className="mb-1.5 block text-xs font-extrabold text-slate-500">Фамилия *</span><input value={form.lastName} onChange={event => update('lastName', event.target.value)} className={inputClass}/><FieldError text={errors.lastName}/></label>
    <label><span className="mb-1.5 block text-xs font-extrabold text-slate-500">Отчество</span><input value={form.middleName} onChange={event => update('middleName', event.target.value)} className={inputClass}/></label>
    <label><span className="mb-1.5 block text-xs font-extrabold text-slate-500">Телефон *</span><input type="tel" inputMode="numeric" value={formatPhone(form.phone)} onChange={event => update('phone', extractPhoneDigits(event.target.value))} className={inputClass}/><FieldError text={errors.phone}/></label>
    <label><span className="mb-1.5 block text-xs font-extrabold text-slate-500">Email *</span><input type="email" value={form.email} onChange={event => update('email', event.target.value)} className={inputClass}/><FieldError text={errors.email}/></label>
    <label><span className="mb-1.5 block text-xs font-extrabold text-slate-500">Дата рождения *</span><input type="date" max={new Date().toISOString().slice(0, 10)} value={form.birthDate} onChange={event => update('birthDate', event.target.value)} className={inputClass}/><FieldError text={errors.birthDate}/></label>
    <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-extrabold text-slate-500">Город проживания *</span><select value={form.city} onChange={event => update('city', event.target.value)} className={inputClass}><option value="">Выберите город</option>{kazakhstanCities.map(city => <option key={city.name}>{city.name}</option>)}</select><FieldError text={errors.city}/></label>
    <label><span className="mb-1.5 block text-xs font-extrabold text-slate-500">Пароль *</span><input type="password" autoComplete="new-password" value={form.password} onChange={event => update('password', event.target.value)} className={inputClass}/><FieldError text={errors.password}/></label>
    <label><span className="mb-1.5 block text-xs font-extrabold text-slate-500">Подтвердите пароль *</span><input type="password" autoComplete="new-password" value={form.confirmPassword} onChange={event => update('confirmPassword', event.target.value)} className={inputClass}/><FieldError text={errors.confirmPassword}/></label>
    <label className="mt-1 flex items-start gap-3 sm:col-span-2"><input type="checkbox" checked={form.consent} onChange={event => update('consent', event.target.checked)} className="mt-0.5 size-5 rounded border-slate-300 accent-emerald-600"/><span className="text-xs leading-5 text-slate-500">Я согласен с условиями обработки персональных данных<FieldError text={errors.consent}/></span></label>
    {errors.submit && <motion.p initial={{ x: -5 }} animate={{ x: [-5, 5, -4, 4, 0] }} className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 sm:col-span-2">{errors.submit}</motion.p>}
    <button disabled={busy} className="mt-1 flex h-13 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-emerald-600 font-black text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 disabled:opacity-60 sm:col-span-2">{busy && <LoaderCircle className="size-4 animate-spin"/>}{busy ? 'Создаём аккаунт…' : 'Создать аккаунт'}</button>
    <p className="text-center text-xs text-slate-500 sm:col-span-2">Уже зарегистрированы? <button type="button" onClick={onLogin} className="font-black text-brand-dark hover:underline">Войти</button></p>
  </motion.form>;
}
