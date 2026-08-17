import type { PartnerTour } from './types.ts';

const headers = { 'User-Agent': 'NextTour catalog gallery import/1.0', 'X-Requested-With': 'XMLHttpRequest' };
const sourceConfigs: Record<string, { base: string; route: string }> = {
  selfie: { base: 'https://b2b.selfietravel.kz', route: '/hotels?' },
  kompas: { base: 'https://online.kz.kompastour.com', route: '/hotels?' },
  funsun: { base: 'https://b2b.fstravel.asia', route: '/d_available_hotels?' },
};
const cache = new Map<string, Promise<string[]>>();

export function extractOperatorImages(text: string, base: string) {
  return [...new Set([...text.matchAll(/((?:https?:)?\/\/[^"')\s]+\.(?:jpe?g|webp|png)(?:\?[^"')\s]*)?|\/[^"')\s]+\.(?:jpe?g|webp|png)(?:\?[^"')\s]*)?)/gi)].map(match => {
    try { return new URL(match[1].replaceAll('\\/', '/'), base).href; } catch { return ''; }
  }).filter(image => image && !/logo|icon|flag|banner|hotelparam|loader|sprite|\/www\.(?:jpe?g|webp|png)\//i.test(image)))];
}

async function fetchText(target: string, referer?: string) {
  try {
    const response = await fetch(target, { headers: { ...headers, ...(referer ? { Referer: referer } : {}) }, signal: AbortSignal.timeout(12000) });
    return response.ok ? await response.text() : '';
  } catch { return ''; }
}

async function loadGallery(tour: PartnerTour) {
  const config = sourceConfigs[tour.partnerSource];
  const pages: string[] = [];
  let base = tour.sourceUrl || config?.base || '';
  if (config && tour.sourceHotelId) {
    const endpoint = `${config.base}${config.route}samo_action=info&embed=${encodeURIComponent(tour.sourceHotelId)}&HOTELINC=${encodeURIComponent(tour.sourceHotelId)}`;
    const info = await fetchText(endpoint, `${config.base}/search_tour`);
    pages.push(info);
    const detailPath = (info.match(/href\\?=[\\"']+((?:\\.|[^"'\\])*)/i)?.[1] ?? info.match(/"(?:url|href)"\s*:\s*"((?:\\.|[^"\\])*)/i)?.[1])
      ?.replaceAll('\\/', '/').replaceAll('\\"', '"');
    if (detailPath) pages.push(await fetchText(new URL(detailPath, config.base).href, `${config.base}/search_tour`));
    if (tour.sourceUrl && !/\/search_tour|maps\.google/i.test(tour.sourceUrl)) pages.push(await fetchText(tour.sourceUrl, `${config.base}/search_tour`));
    base = tour.partnerSource === 'kompas' ? 'https://kompastour.com/' : `${config.base}/`;
  } else if (tour.sourceUrl && /^https?:\/\//i.test(tour.sourceUrl)) {
    pages.push(await fetchText(tour.sourceUrl));
  }
  const images = extractOperatorImages(pages.join('\n'), base);
  return tour.partnerSource === 'kompas'
    ? images.filter(image => /\/useruploads\/(?:hotels|hotels_room)\//i.test(image))
    : images;
}

export function getOperatorGallery(tour: PartnerTour) {
  const key = `${tour.partnerSource}:${tour.sourceHotelId || tour.sourceUrl || tour.externalOfferId}`;
  const existing = cache.get(key);
  if (existing) return existing;
  const request = loadGallery(tour);
  cache.set(key, request);
  return request;
}

export async function mapWithConcurrency<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}
