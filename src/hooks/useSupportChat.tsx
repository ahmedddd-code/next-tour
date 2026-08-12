import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const CREDENTIALS_KEY = 'nexttour:support-chat-credentials:v1';
const ADMIN_PASSWORD = 'nexttour123';
type ChatCredentials = { conversationId: string; accessToken: string };

export type SupportMessage = { id: string; role: 'user' | 'manager' | 'system'; text: string; createdAt: string };
export type SupportConversation = { id: string; status: 'open' | 'closed'; createdAt: string; updatedAt: string; messages: SupportMessage[] };
type ContextValue = {
  conversations: SupportConversation[];
  currentConversationId: string | null;
  error: string;
  sendUserMessage: (text: string) => Promise<void>;
  sendManagerMessage: (conversationId: string, text: string) => Promise<void>;
  toggleConversationStatus: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
};

const SupportChatContext = createContext<ContextValue | null>(null);

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
  const [credentials, setCredentials] = useState<ChatCredentials | null>(loadCredentials);
  const [error, setError] = useState('');

  const loadUserConversation = useCallback(async (chatCredentials = credentials) => {
    if (!isSupabaseConfigured || !chatCredentials) return;
    try {
      const data = await invoke({ action: 'user_load', ...chatCredentials });
      const conversation = data.conversation as SupportConversation | null;
      setConversations(conversation ? [conversation] : []);
      setError('');
    } catch { setError('Не удалось обновить чат. Проверьте интернет-соединение.'); }
  }, [credentials]);

  const loadAdminConversations = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const data = await invoke({ action: 'admin_list', adminPassword: ADMIN_PASSWORD });
      setConversations((data.conversations as SupportConversation[]) ?? []);
      setError('');
    } catch { setError('Не удалось загрузить обращения клиентов.'); }
  }, []);

  useEffect(() => {
    const refresh = () => {
      if (sessionStorage.getItem('nexttour:admin-authenticated') === 'true') void loadAdminConversations();
      else void loadUserConversation();
    };
    refresh();
    const timer = window.setInterval(refresh, 4000);
    return () => window.clearInterval(timer);
  }, [loadAdminConversations, loadUserConversation]);

  const value = useMemo<ContextValue>(() => ({
    conversations,
    currentConversationId: credentials?.conversationId ?? null,
    error,
    sendUserMessage: async text => {
      try {
        const data = await invoke({ action: 'user_send', text, ...credentials });
        const nextCredentials: ChatCredentials = { conversationId: String(data.conversationId), accessToken: String(data.accessToken) };
        localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(nextCredentials));
        setCredentials(nextCredentials);
        await loadUserConversation(nextCredentials);
      } catch { setError('Сообщение не отправлено. Попробуйте ещё раз.'); }
    },
    sendManagerMessage: async (conversationId, text) => {
      try { await invoke({ action: 'admin_send', adminPassword: ADMIN_PASSWORD, conversationId, text }); await loadAdminConversations(); }
      catch { setError('Ответ не отправлен. Попробуйте ещё раз.'); }
    },
    toggleConversationStatus: async conversationId => {
      const conversation = conversations.find(item => item.id === conversationId);
      try { await invoke({ action: 'admin_status', adminPassword: ADMIN_PASSWORD, conversationId, status: conversation?.status === 'open' ? 'closed' : 'open' }); await loadAdminConversations(); }
      catch { setError('Не удалось изменить статус диалога.'); }
    },
    deleteConversation: async conversationId => {
      try { await invoke({ action: 'admin_delete', adminPassword: ADMIN_PASSWORD, conversationId }); await loadAdminConversations(); }
      catch { setError('Не удалось удалить диалог.'); }
    },
  }), [conversations, credentials, error, loadAdminConversations, loadUserConversation]);

  return <SupportChatContext.Provider value={value}>{children}</SupportChatContext.Provider>;
}

export function useSupportChat() {
  const context = useContext(SupportChatContext);
  if (!context) throw new Error('useSupportChat должен использоваться внутри SupportChatProvider');
  return context;
}
