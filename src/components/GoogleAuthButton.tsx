import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function GoogleLogo() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.12-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.63.39 3.17 1.04 4.55l3.35-2.62Z"/>
    <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"/>
  </svg>;
}

export function GoogleAuthButton({ className = '' }: { className?: string }) {
  const { loginWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function startGoogleLogin() {
    setBusy(true);
    setError('');
    const message = await loginWithGoogle();
    if (message) { setError(message); setBusy(false); }
  }

  return <div className={className}>
    <div className="mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.14em] text-slate-400"><span className="h-px flex-1 bg-slate-200"/>или<span className="h-px flex-1 bg-slate-200"/></div>
    <button type="button" onClick={startGoogleLogin} disabled={busy} className="flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white font-extrabold text-navy shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:opacity-60">
      {busy ? <LoaderCircle className="size-5 animate-spin text-slate-400"/> : <GoogleLogo/>}
      {busy ? 'Открываем Google…' : 'Продолжить с Google'}
    </button>
    {error && <p className="mt-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">{error}</p>}
  </div>;
}
