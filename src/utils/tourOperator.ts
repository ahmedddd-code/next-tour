const operators: Record<string, { name: string; url: string }> = {
  selfie: { name: 'Selfie Travel', url: 'https://www.selfietravel.kz/' },
  kompas: { name: 'KOMPAS', url: 'https://kompastour.com/kz/rus/' },
  funsun: { name: 'FUN&SUN', url: 'https://fstravel.asia/' },
  pegas: { name: 'PEGAS Touristik', url: 'https://kz.pegast.asia/' },
};

export function tourOperator(source?: string, sourceUrl?: string) {
  if (!source) return null;
  const known = operators[source.toLowerCase()];
  if (known) return known;
  try {
    const url = new URL(sourceUrl ?? '');
    if (url.protocol === 'https:') return { name: source, url: `${url.origin}/` };
  } catch { /* Для неизвестного оператора покажем название без ссылки. */ }
  return { name: source, url: '' };
}
