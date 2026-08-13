import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAutoRefresh } from './useAutoRefresh';

const CREDENTIALS_KEY = 'nexttour:support-chat-credentials:v1';
const ADMIN_PASSWORD = 'nexttour123';
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
  sendUserMessage: (text: string, contact?: SupportContact) => Promise<void>;
  respondToCloseRequest: (resolved: boolean) => Promise<void>;
  sendManagerMessage: (conversationId: string, text: string) => Promise<void>;
  toggleConversationStatus: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  setUserTyping: (typing: boolean) => void;
  setManagerTyping: (conversationId: string, typing: boolean) => void;
};

const SupportChatContext = createContext<ContextValue | null>(null);
const refreshInterval = () => 1000;

function loadCredentials() {
  try { const saved = localStorage.getItem(CREDENTIALS_KEY); return saved ? JSON.parse(saved) as ChatCredentials : null; }
  catch { return null; }
}

async function invoke(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('support-chat', { body });
  if (error) throw error;
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

  const loadUserConversation = useCallback(async (chatCredentials = credentials) => {
    if (!isSupabaseConfigured || !chatCredentials) return;
    try {
      const data = await invoke({ action: 'user_load', ...chatCredentials });
      const conversation = data.conversation as SupportConversation | null;
      if (!conversation) {
        localStorage.removeItem(CREDENTIALS_KEY);
        setCredentials(null);
      }
      const next = conversation ? [conversation] : [];
      setConversations(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
      setLoaded(true);
      setError('');
    } catch { setError('Не удалось обновить чат. Проверьте интернет-соединение.'); }
  }, [credentials]);

  const loadAdminConversations = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const data = await invoke({ action: 'admin_list', adminPassword: ADMIN_PASSWORD });
      const next = (data.conversations as SupportConversation[]) ?? [];
      setConversations(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
      setLoaded(true);
      setError('');
    } catch { setError('Не удалось загрузить обращения клиентов.'); }
  }, []);

  const refresh = useCallback(async () => {
    if (sessionStorage.getItem('nexttour:admin-authenticated') === 'true') await loadAdminConversations();
    else await loadUserConversation();
  }, [loadAdminConversations, loadUserConversation]);
  useAutoRefresh(refresh, refreshInterval);

  const setUserTyping = useCallback((typing: boolean) => {
    if (!credentials || (typing && Date.now() - lastTypingUpdate.current < 1500)) return;
    lastTypingUpdate.current = Date.now();
    void invoke({ action: 'user_typing', ...credentials, typing });
  }, [credentials]);

  const setManagerTyping = useCallback((conversationId: string, typing: boolean) => {
    if (typing && Date.now() - lastTypingUpdate.current < 1500) return;
    lastTypingUpdate.current = Date.now();
    void invoke({ action: 'admin_typing', adminPassword: ADMIN_PASSWORD, conversationId, typing });
  }, []);

  const value = useMemo<ContextValue>(() => ({
    conversations, loaded,
    currentConversationId: credentials?.conversationId ?? null,
    error,
    pendingUserMessages,
    sendUserMessage: async (text, contact) => {
      const pending: SupportMessage = { id: `pending-${crypto.randomUUID()}`, role: 'user', text, createdAt: new Date().toISOString() };
      setPendingUserMessages(current => [...current, pending]);
      try {
        const data = await invoke({ action: 'user_send', text, contact, ...credentials });
        const nextCredentials: ChatCredentials = { conversationId: String(data.conversationId), accessToken: String(data.accessToken) };
        localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(nextCredentials));
        setCredentials(nextCredentials);
        await loadUserConversation(nextCredentials);
        setPendingUserMessages(current => current.filter(message => message.id !== pending.id));
      } catch { setPendingUserMessages(current => current.filter(message => message.id !== pending.id)); setError('Не удалось отправить сообщение. Проверьте подключение к интернету или попробуйте позже.'); throw new Error('support-send-failed'); }
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
      try { await invoke({ action: 'admin_send', adminPassword: ADMIN_PASSWORD, conversationId, text }); await loadAdminConversations(); }
      catch { setError('Ответ не отправлен. Попробуйте ещё раз.'); }
    },
    toggleConversationStatus: async conversationId => {
      const conversation = conversations.find(item => item.id === conversationId);
      try { await invoke({ action: 'admin_status', adminPassword: ADMIN_PASSWORD, conversationId, status: conversation?.status === 'open' ? 'pending_close' : 'open' }); await loadAdminConversations(); }
      catch { setError('Не удалось изменить статус диалога.'); }
    },
    deleteConversation: async conversationId => {
      try { await invoke({ action: 'admin_delete', adminPassword: ADMIN_PASSWORD, conversationId }); await loadAdminConversations(); }
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
