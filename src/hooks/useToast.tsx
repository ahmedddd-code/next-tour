import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

type Toast = { id: string; type: 'success' | 'error'; title: string; message?: string };
type ToastContextValue = { success: (title: string, message?: string) => void; error: (title: string, message?: string) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: string) => setToasts(current => current.filter(toast => toast.id !== id)), []);
  const show = useCallback((type: Toast['type'], title: string, message?: string) => {
    const id = crypto.randomUUID();
    setToasts(current => [...current.slice(-2), { id, type, title, message }]);
    window.setTimeout(() => dismiss(id), 3000);
  }, [dismiss]);
  const value = useMemo(() => ({ success: (title: string, message?: string) => show('success', title, message), error: (title: string, message?: string) => show('error', title, message) }), [show]);
  return <ToastContext.Provider value={value}>{children}<div className="pointer-events-none fixed inset-x-3 top-3 z-[13000] flex flex-col items-end gap-2 sm:left-auto sm:right-5 sm:top-5 sm:w-[400px]">{toasts.map(toast => <div key={toast.id} className={`pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${toast.type === 'success' ? 'animate-toast-in border-emerald-100' : 'animate-toast-error border-red-100'}`}>{toast.type === 'success' ? <CheckCircle2 className="size-6 shrink-0 text-brand-dark"/> : <AlertTriangle className="size-6 shrink-0 text-red-500"/>}<span className="min-w-0 flex-1"><strong className="block text-sm text-navy">{toast.title}</strong>{toast.message && <span className="mt-1 block text-xs leading-5 text-slate-500">{toast.message}</span>}</span><button onClick={() => dismiss(toast.id)} className="grid size-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100" aria-label="Закрыть"><X className="size-4"/></button></div>)}</div></ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast должен использоваться внутри ToastProvider');
  return context;
}
