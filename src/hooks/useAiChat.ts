import { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useTours } from './useTours';

export type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string };

const welcome: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Привет! Какой отдых вам хочется? Я уточню бюджет, даты и количество туристов, а затем предложу подходящие туры.',
};

export function useAiChat() {
  const { tours } = useTours();
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendMessage(text: string) {
    const cleanText = text.trim();
    if (!cleanText || loading) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: cleanText };
    const history = [...messages, userMessage];
    setMessages(history);
    setLoading(true);
    setError('');

    if (!isSupabaseConfigured) {
      setError('AI ещё не настроен: добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env.');
      setLoading(false);
      return;
    }

    const catalog = tours.slice(0, 30).map(tour => ({
      id: tour.id, hotel: tour.hotel, country: tour.country, resort: tour.resort,
      departure: tour.departureCity, dates: tour.dates, nights: tour.nights,
      meal: tour.meal, price: tour.price, rating: tour.rating, hot: tour.isHot,
    }));
    const system = `Ты — дружелюбный турагент казахстанской компании NEXT TOUR. Отвечай по-русски, кратко и конкретно. Все цены указаны в казахстанских тенге (₸) за двоих. Перед подбором выясни три параметра: бюджет, даты и количество человек. Если чего-то не хватает — задай один понятный уточняющий вопрос. Предлагай только туры из каталога ниже, максимум три варианта. Не выдумывай цены и отели. Для выбранного варианта укажи точное название и ссылку /tour/ID. Каталог: ${JSON.stringify(catalog)}`;
    const prompt = history.map(message => `${message.role === 'user' ? 'Клиент' : 'Ассистент'}: ${message.text}`).join('\n');

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('ai', { body: { prompt, system } });
      if (invokeError) throw invokeError;
      if (!data?.text) throw new Error(data?.error || 'AI вернул пустой ответ');
      setMessages(current => [...current, { id: crypto.randomUUID(), role: 'assistant', text: data.text as string }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось получить ответ. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  return { messages, loading, error, sendMessage };
}
