import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { extractPhoneDigits, phoneForAuth } from '../utils/phone';

export type AuthTab = 'login' | 'register';
export type RegisterData = {
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
  email: string;
  birthDate: string;
  city: string;
  password: string;
};
export type UserProfile = { firstName: string; lastName: string; middleName: string; phone: string; email: string; birthDate: string; city: string };

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  modalOpen: boolean;
  authTab: AuthTab;
  registrationSuccess: boolean;
  passwordRecovery: boolean;
  openAuth: (tab?: AuthTab) => void;
  requestAuth: (onAuthenticated: () => void, tab?: AuthTab) => void;
  closeAuth: () => void;
  setAuthTab: (tab: AuthTab) => void;
  login: (identifier: string, password: string) => Promise<string | null>;
  loginWithGoogle: () => Promise<string | null>;
  register: (data: RegisterData) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function profileFromUser(user: User | null): UserProfile | null {
  if (!user) return null;
  const metadata = user.user_metadata as Record<string, unknown>;
  const fullName = String(metadata.full_name ?? metadata.name ?? '').trim().split(/\s+/);
  return {
    firstName: String(metadata.firstName ?? metadata.given_name ?? fullName[0] ?? ''),
    lastName: String(metadata.lastName ?? metadata.family_name ?? fullName.slice(1).join(' ') ?? ''),
    middleName: String(metadata.middleName ?? ''),
    phone: String(metadata.phone ?? user.phone ?? ''), email: user.email ?? '', birthDate: String(metadata.birthDate ?? ''), city: String(metadata.city ?? ''),
  };
}

function authError(message: string) {
  if (/invalid login credentials/i.test(message)) return 'Неверный телефон, email или пароль.';
  if (/already registered|already been registered|already exists/i.test(message)) return 'Аккаунт с таким email или телефоном уже существует.';
  if (/rate limit|too many/i.test(message)) return 'Слишком много попыток. Подождите немного и попробуйте снова.';
  return 'Не удалось выполнить действие. Проверьте данные и интернет-соединение.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void import('../lib/supabase').then(async ({ supabase }) => {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!active) return;
        setUser(session?.user ?? null);
        if (event === 'PASSWORD_RECOVERY') { setPasswordRecovery(true); setModalOpen(true); }
      });
      unsubscribe = () => data.subscription.unsubscribe();
      const { data: sessionData } = await supabase.auth.getSession();
      if (active) { setUser(sessionData.session?.user ?? null); setLoading(false); }
    });
    return () => { active = false; unsubscribe?.(); };
  }, []);

  const finishAuth = useCallback((nextUser: User, registered = false) => {
    setUser(nextUser);
    setModalOpen(false);
    if (registered) {
      setRegistrationSuccess(true);
      window.setTimeout(() => setRegistrationSuccess(false), 3000);
    }
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile: profileFromUser(user),
    loading,
    modalOpen,
    authTab,
    registrationSuccess,
    passwordRecovery,
    openAuth: (tab = 'login') => { setAuthTab(tab); setModalOpen(true); },
    requestAuth: (action, tab = 'register') => { if (user) action(); else { pendingAction.current = action; setAuthTab(tab); setModalOpen(true); } },
    closeAuth: () => { pendingAction.current = null; setModalOpen(false); },
    setAuthTab,
    login: async (identifier, password) => {
      try {
        const { supabase } = await import('../lib/supabase');
        const clean = identifier.trim();
        const credentials = clean.includes('@') ? { email: clean.toLowerCase(), password } : { phone: phoneForAuth(extractPhoneDigits(clean)), password };
        const { data, error } = await supabase.auth.signInWithPassword(credentials);
        if (error || !data.user) return authError(error?.message ?? 'Login failed');
        finishAuth(data.user);
        return null;
      } catch (error) { return authError(error instanceof Error ? error.message : 'Login failed'); }
    },
    loginWithGoogle: async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const redirectTo = `${window.location.origin}${window.location.pathname}${window.location.search}`;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'select_account' } },
        });
        return error ? authError(error.message) : null;
      } catch (error) { return authError(error instanceof Error ? error.message : 'Google login failed'); }
    },
    register: async data => {
      try {
        const { supabase } = await import('../lib/supabase');
        const response = await supabase.functions.invoke('auth-register', { body: { ...data, phone: phoneForAuth(data.phone) } });
        if (response.error || response.data?.error) return authError(String(response.data?.error ?? response.error?.message));
        const signedIn = await supabase.auth.signInWithPassword({ email: data.email.toLowerCase(), password: data.password });
        if (signedIn.error || !signedIn.data.user) return authError(signedIn.error?.message ?? 'Login failed');
        finishAuth(signedIn.data.user, true);
        return null;
      } catch (error) { return authError(error instanceof Error ? error.message : 'Registration failed'); }
    },
    resetPassword: async email => {
      if (!email.includes('@')) return 'Для восстановления пароля введите Email.';
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: window.location.origin });
      return error ? authError(error.message) : null;
    },
    updatePassword: async password => {
      if (password.length < 8) return 'Пароль должен содержать не менее 8 символов.';
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return authError(error.message);
      setPasswordRecovery(false);
      setModalOpen(false);
      return null;
    },
    logout: async () => { const { supabase } = await import('../lib/supabase'); await supabase.auth.signOut(); setUser(null); },
  }), [user, loading, modalOpen, authTab, registrationSuccess, passwordRecovery, finishAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return context;
}
