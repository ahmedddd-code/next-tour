import { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useTours } from './useTours';

export type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string };

const welcome: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Привет! Расскажите, каким вы представляете свой отдых — море, новые места, тишина или побольше впечатлений? Подберём вариант вместе 🙂',
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
    const system = `Ты — NEXT AI, внимательный travel-консультант казахстанской компании NEXT TOUR. Общайся по-русски тепло, естественно и по-человечески, как хороший менеджер в личной переписке. Обращайся на «вы». Сначала откликайся на пожелание клиента, затем помогай по делу. Не повторяй приветствие, не используй канцелярит, шаблонные фразы и длинные списки. Задавай только один вопрос за сообщение. Если данных уже достаточно, не устраивай анкету и сразу предложи варианты. Для точного подбора важны бюджет, даты, город вылета и количество туристов, но уточняй только действительно недостающее. Можно использовать не больше одного уместного эмодзи в ответе.

Все цены в каталоге указаны в казахстанских тенге (₸) за двоих. Предлагай только реальные туры из каталога ниже — максимум три за один ответ. Не выдумывай отели, цены и детали. Для каждого предложенного тура обязательно добавляй кликабельную ссылку строго в формате [Открыть тур](/tour/ID), подставляя его настоящий id из каталога. Каталог: ${JSON.stringify(catalog)}`;
    const prompt = history.map(message => `${message.role === 'user' ? 'Клиент' : 'Ассистент'}: ${message.text}`).join('\n');

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('ai', { body: { prompt, system } });
      if (invokeError) {
        const response = invokeError.context instanceof Response ? invokeError.context : null;
        const details = response ? await response.clone().json().catch(() => null) as { error?: string } | null : null;
        throw new Error(details?.error || invokeError.message);
      }
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
