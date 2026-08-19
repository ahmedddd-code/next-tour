import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAutoRefresh } from './useAutoRefresh';
import { getAdminToken } from '../lib/adminSession';

const CREDENTIALS_KEY = 'nexttour:support-chat-credentials:v1';
type ChatCredentials = { conversationId: string; accessToken: string };

export type SupportMessage = { id: string; role: 'user' | 'manager' | 'system'; text: string; createdAt: string };
export type SupportContact = { name: string; phone: string; email: string; subject: string };
export type SupportConversation = { id: string; status: 'open' | 'pending_close' | 'closed'; createdAt: string; updatedAt: string; contact?: SupportContact; messages: SupportMessage[]; userTyping?: boolean; managerTyping?: boolean };
type ContextValue = {
  conversations: SupportConversation[];
  loaded: boolean;
  currentConversationId: string | null;
  error: string;
  pendingUserMessages: SupportMessage[];
  startNewConversation: () => void;
  sendUserMessage: (text: string, contact?: SupportContact) => Promise<void>;
  respondToCloseRequest: (resolved: boolean) => Promise<void>;
  sendManagerMessage: (conversationId: string, text: string) => Promise<void>;
  toggleConversationStatus: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  setUserTyping: (typing: boolean) => void;
  setManagerTyping: (conversationId: string, typing: boolean) => void;
};

const SupportChatContext = createContext<ContextValue | null>(null);
const refreshInterval = () => 4000;

function loadCredentials() {
  try { const saved = localStorage.getItem(CREDENTIALS_KEY); return saved ? JSON.parse(saved) as ChatCredentials : null; }
  catch { return null; }
}

function saveCredentials(credentials: ChatCredentials | null) {
  try {
    if (credentials) localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    else localStorage.removeItem(CREDENTIALS_KEY);
  } catch {
    // The chat still works when storage is unavailable (for example in private mode).
  }
}

function readableError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : '';
  if (/failed to fetch|network|load failed/i.test(message) || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return 'Нет связи с сервером чата. Проверьте подключение и попробуйте ещё раз.';
  }
  if (/unauthorized|jwt|401/i.test(message)) return 'Сессия чата устарела. Обновите страницу и попробуйте ещё раз.';
  return message && !/edge function returned/i.test(message) ? message : fallback;
}

async function invoke(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('support-chat', { body });
  if (error) {
    const context = 'context' in error ? error.context : null;
    if (context instanceof Response) {
      const payload = await context.clone().json().catch(() => null) as { error?: unknown } | null;
      if (payload?.error) throw new Error(String(payload.error));
    }
    throw error;
  }
  if (data?.error) throw new Error(String(data.error));
  return data as Record<string, unknown>;
}

export function SupportChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [credentials, setCredentials] = useState<ChatCredentials | null>(loadCredentials);
  const [error, setError] = useState('');
  const [pendingUserMessages, setPendingUserMessages] = useState<SupportMessage[]>([]);
  const lastTypingUpdate = useRef(0);
  const failedRefreshes = useRef(0);

  const loadUserConversation = useCallback(async (chatCredentials = credentials) => {
    if (!isSupabaseConfigured || !chatCredentials) return;
    try {
      const data = await invoke({ action: 'user_load', ...chatCredentials });
      const conversation = data.conversation as SupportConversation | null;
      if (!conversation) {
        saveCredentials(null);
        setCredentials(null);
      }
      const next = conversation ? [conversation] : [];
      setConversations(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
      setLoaded(true);
      failedRefreshes.current = 0;
      setError('');
    } catch (caught) {
      failedRefreshes.current += 1;
      if (failedRefreshes.current >= 3) setError(readableError(caught, 'Сервис чата временно недоступен. Попробуйте ещё раз позже.'));
    }
  }, [credentials]);

  const loadAdminConversations = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const data = await invoke({ action: 'admin_list', adminToken: getAdminToken() });
      const next = (data.conversations as SupportConversation[]) ?? [];
      setConversations(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
      setLoaded(true);
      setError('');
    } catch { setError('Не удалось загрузить обращения клиентов.'); }
  }, []);

  const refresh = useCallback(async () => {
    if (getAdminToken()) await loadAdminConversations();
    else await loadUserConversation();
  }, [loadAdminConversations, loadUserConversation]);
  useAutoRefresh(refresh, refreshInterval);

  const setUserTyping = useCallback((typing: boolean) => {
    if (!credentials || (typing && Date.now() - lastTypingUpdate.current < 1500)) return;
    lastTypingUpdate.current = Date.now();
    void invoke({ action: 'user_typing', ...credentials, typing }).catch(() => undefined);
  }, [credentials]);

  const setManagerTyping = useCallback((conversationId: string, typing: boolean) => {
    if (typing && Date.now() - lastTypingUpdate.current < 1500) return;
    lastTypingUpdate.current = Date.now();
    void invoke({ action: 'admin_typing', adminToken: getAdminToken(), conversationId, typing }).catch(() => undefined);
  }, []);

  const value = useMemo<ContextValue>(() => ({
    conversations, loaded,
    currentConversationId: credentials?.conversationId ?? null,
    error,
    pendingUserMessages,
    startNewConversation: () => {
      saveCredentials(null);
      setCredentials(null);
      setConversations([]);
      setPendingUserMessages([]);
      setError('');
    },
    sendUserMessage: async (text, contact) => {
      const pending: SupportMessage = { id: `pending-${crypto.randomUUID()}`, role: 'user', text, createdAt: new Date().toISOString() };
      setPendingUserMessages(current => [...current, pending]);
      try {
        const data = await invoke({ action: 'user_send', text, contact, ...credentials });
        const nextCredentials: ChatCredentials = { conversationId: String(data.conversationId), accessToken: String(data.accessToken) };
        saveCredentials(nextCredentials);
        setCredentials(nextCredentials);
        await loadUserConversation(nextCredentials);
        setPendingUserMessages(current => current.filter(message => message.id !== pending.id));
      } catch (caught) { setPendingUserMessages(current => current.filter(message => message.id !== pending.id)); setError(readableError(caught, 'Не удалось отправить сообщение. Попробуйте ещё раз позже.')); throw caught; }
    },
    respondToCloseRequest: async resolved => {
      if (!credentials) throw new Error('support-conversation-not-found');
      try {
        await invoke({ action: 'user_close_response', resolved, ...credentials });
        await loadUserConversation(credentials);
      } catch {
        setError('Не удалось отправить ответ. Попробуйте ещё раз.');
        throw new Error('support-close-response-failed');
      }
    },
    sendManagerMessage: async (conversationId, text) => {
      const pending: SupportMessage = { id: `pending-${crypto.randomUUID()}`, role: 'manager', text, createdAt: new Date().toISOString() };
      setConversations(current => current.map(conversation => conversation.id === conversationId ? { ...conversation, messages: [...conversation.messages, pending] } : conversation));
      try { await invoke({ action: 'admin_send', adminToken: getAdminToken(), conversationId, text }); await loadAdminConversations(); }
      catch { setError('Ответ не отправлен. Попробуйте ещё раз.'); }
    },
    toggleConversationStatus: async conversationId => {
      const conversation = conversations.find(item => item.id === conversationId);
      try { await invoke({ action: 'admin_status', adminToken: getAdminToken(), conversationId, status: conversation?.status === 'open' ? 'pending_close' : 'open' }); await loadAdminConversations(); }
      catch { setError('Не удалось изменить статус диалога.'); }
    },
    deleteConversation: async conversationId => {
      try { await invoke({ action: 'admin_delete', adminToken: getAdminToken(), conversationId }); await loadAdminConversations(); }
      catch { setError('Не удалось удалить диалог.'); }
    },
    setUserTyping,
    setManagerTyping,
  }), [conversations, loaded, credentials, error, pendingUserMessages, loadAdminConversations, loadUserConversation, setUserTyping, setManagerTyping]);

  return <SupportChatContext.Provider value={value}>{children}</SupportChatContext.Provider>;
}

export function useSupportChat() {
  const context = useContext(SupportChatContext);
  if (!context) throw new Error('useSupportChat должен использоваться внутри SupportChatProvider');
  return context;
}
