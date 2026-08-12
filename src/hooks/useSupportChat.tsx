import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'nexttour:support-chats:v1';
const SESSION_KEY = 'nexttour:support-conversation-id';

export type SupportMessage = { id: string; role: 'user' | 'manager' | 'system'; text: string; createdAt: string };
export type SupportConversation = { id: string; status: 'open' | 'closed'; createdAt: string; updatedAt: string; messages: SupportMessage[] };
type ContextValue = {
  conversations: SupportConversation[];
  currentConversationId: string | null;
  sendUserMessage: (text: string) => void;
  sendManagerMessage: (conversationId: string, text: string) => void;
  toggleConversationStatus: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
};

const SupportChatContext = createContext<ContextValue | null>(null);

function loadConversations() {
  try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) as SupportConversation[] : []; }
  catch { return []; }
}

export function SupportChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<SupportConversation[]>(loadConversations);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(() => sessionStorage.getItem(SESSION_KEY));

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)); }, [conversations]);
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === STORAGE_KEY) setConversations(loadConversations()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const value = useMemo<ContextValue>(() => ({
    conversations,
    currentConversationId,
    sendUserMessage: text => {
      const now = new Date().toISOString();
      const id = currentConversationId ?? `chat-${crypto.randomUUID()}`;
      if (!currentConversationId) { sessionStorage.setItem(SESSION_KEY, id); setCurrentConversationId(id); }
      setConversations(current => {
        const existing = current.find(conversation => conversation.id === id);
        const userMessage: SupportMessage = { id: crypto.randomUUID(), role: 'user', text, createdAt: now };
        if (existing) return current.map(conversation => conversation.id === id ? { ...conversation, status: 'open', updatedAt: now, messages: [...conversation.messages, userMessage] } : conversation);
        const systemMessage: SupportMessage = { id: crypto.randomUUID(), role: 'system', text: 'Сообщение передано менеджеру. Обычно мы отвечаем в течение 5 минут.', createdAt: now };
        return [{ id, status: 'open', createdAt: now, updatedAt: now, messages: [userMessage, systemMessage] }, ...current];
      });
    },
    sendManagerMessage: (conversationId, text) => setConversations(current => current.map(conversation => conversation.id === conversationId ? { ...conversation, status: 'open', updatedAt: new Date().toISOString(), messages: [...conversation.messages, { id: crypto.randomUUID(), role: 'manager', text, createdAt: new Date().toISOString() }] } : conversation)),
    toggleConversationStatus: conversationId => setConversations(current => current.map(conversation => conversation.id === conversationId ? { ...conversation, status: conversation.status === 'open' ? 'closed' : 'open' } : conversation)),
    deleteConversation: conversationId => setConversations(current => current.filter(conversation => conversation.id !== conversationId)),
  }), [conversations, currentConversationId]);

  return <SupportChatContext.Provider value={value}>{children}</SupportChatContext.Provider>;
}

export function useSupportChat() {
  const context = useContext(SupportChatContext);
  if (!context) throw new Error('useSupportChat должен использоваться внутри SupportChatProvider');
  return context;
}
