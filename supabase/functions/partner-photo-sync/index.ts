import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.0';

type Tour = {
  id: string; hotel: string; country: string; partnerSource?: string; sourceHotelId?: string;
  externalOfferId?: string; sourceUrl?: string; images: string[]; rating: number; reviews: number; syncedAt?: string;
};

const url = Deno.env.get('SUPABASE_URL');
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const fallbackImage = '/images/tour-placeholder.svg';
const headers = { 'User-Agent': 'NextTour partner photo sync/1.0', 'X-Requested-With': 'XMLHttpRequest' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const cleanName = (value: string) => value.toLowerCase().replace(/&amp;/g, '&').replace(/\([^)]*\)/g, '')
  .replace(/\b(?:hotel|resort|spa|apartments?|no category|one ?star|two ?star|three ?star|four ?star|five ?star)\b/g, '')
  .replace(/\d\s*\*|[^\p{L}\p{N}]+/gu, ' ').trim();
const absoluteImages = (text: string, base: string) => [...new Set([...text.matchAll(/((?:https?:)?\/\/[^"')\s]+\.(?:jpe?g|webp|png)(?:\?[^"')\s]*)?|\/[^"')\s]+\.(?:jpe?g|webp|png)(?:\?[^"')\s]*)?)/gi)].map(match => {
  try { return new URL(match[1].replaceAll('\\/', '/'), base).href; } catch { return ''; }
}).filter(image => image && !/logo|icon|flag|banner|hotelparam|loader|sprite|\/www\.(?:jpe?g|webp|png)\//i.test(image)))];

const samoSources: Record<string, { base: string; route: string }> = {
  selfie: { base: 'https://b2b.selfietravel.kz', route: '/hotels?' },
  kompas: { base: 'https://online.kz.kompastour.com', route: '/hotels?' },
  funsun: { base: 'https://b2b.fstravel.asia', route: '/d_available_hotels?' },
};

async function samoHotelImages(source: string, hotelId: string, sourceUrl?: string) {
  const config = samoSources[source];
  if (!config) return [];
  const endpoint = `${config.base}${config.route}samo_action=info&embed=${encodeURIComponent(hotelId)}&HOTELINC=${encodeURIComponent(hotelId)}`;
  const response = await fetch(endpoint, { headers: { ...headers, Referer: `${config.base}/search_tour` } });
  if (!response.ok) throw new Error(`${source} hotel photos: HTTP ${response.status}`);
  const info = await response.text();
  const detailPath = (info.match(/href\\?=[\\"']+((?:\\.|[^"'\\])*)/i)?.[1] ?? info.match(/"(?:url|href)"\s*:\s*"((?:\\.|[^"\\])*)/i)?.[1])
    ?.replaceAll('\\/', '/').replaceAll('\\"', '"');
  const detailUrl = detailPath ? new URL(detailPath, config.base).href : '';
  const exactSourceUrl = sourceUrl && !sourceUrl.includes('/search_tour') ? sourceUrl : '';
  const detailUrls = [...new Set([detailUrl, exactSourceUrl].filter(Boolean))];
  const details = await Promise.all(detailUrls.map(target => fetch(target, { headers: { ...headers, Referer: `${config.base}/search_tour` } }).then(result => result.ok ? result.text() : '').catch(() => '')));
  const imageBase = source === 'kompas' ? 'https://kompastour.com/' : `${config.base}/`;
  const images = absoluteImages([info, ...details].join('\n'), imageBase);
  return source === 'kompas' ? images.filter(image => /\/useruploads\/(?:hotels|hotels_room)\//i.test(image)) : images;
}

const countrySlugs: Record<string, string> = {
  Австрия: 'austria', Азербайджан: 'azerbaijan', Армения: 'armenia', Грузия: 'georgia', Египет: 'egypt',
  ОАЭ: 'uae', Турция: 'turkey', Таиланд: 'thailand', Вьетнам: 'vietnam', Мальдивы: 'maldives',
  Китай: 'china', Индонезия: 'indonesia', Катар: 'qatar', 'Шри-Ланка': 'sri_lanka', Черногория: 'montenegro',
  Казахстан: 'kazakhstan', Кыргызстан: 'kyrgyzstan', Маврикий: 'mauritius', Венгрия: 'hungary', Бразилия: 'brazil',
  Аргентина: 'argentina', Великобритания: 'great_britain', Индия: 'india', Кипр: 'cyprus', Сейшелы: 'seychelles',
  Италия: 'italy', Испания: 'spain', Греция: 'greece', Болгария: 'bulgaria', Албания: 'albania',
  Бахрейн: 'bahrain', 'Саудовская Аравия': 'saudi_arabia', Узбекистан: 'uzbekistan', Япония: 'japan',
  'Занзибар (Танзания)': 'tanzania', Танзания: 'tanzania', Малайзия: 'malaysia', Сингапур: 'singapore', США: 'usa',
};

type KompasHotel = { name: string; images: string[]; link: string; category: number };

function parseKompasCatalog(html: string, catalogUrl: string): KompasHotel[] {
  const blocks = [...html.matchAll(/<div class="block">([\s\S]*?)<div class="hotel_btn"/gi)];
  return blocks.map(match => {
    const block = match[1];
    const name = block.match(/class="hotel_name"[^>]*>([\s\S]*?)<\/a>/i)?.[1]?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
    const path = block.match(/background-image:\s*url\(([^)]+)\)/i)?.[1]?.replace(/["']/g, '') ?? '';
    const link = block.match(/href=["']([^"']+)["'][^>]*class="hotel_name"/i)?.[1] ?? '';
    const category = Math.min(5, [...block.matchAll(/<img[^>]+(?:star\.svg|class=["'][^"']*star)/gi)].length);
    return { name: cleanName(name), images: path ? [new URL(path, catalogUrl).href] : [], link: link ? new URL(link, catalogUrl).href : '', category };
  }).filter(item => item.name && item.images.length);
}

const matchesName = (candidate: string, target: string) => candidate === target;

async function kompasCatalog(country: string, targets: string[]) {
  const slug = countrySlugs[country];
  if (!slug) return [] as KompasHotel[];
  const catalogUrl = `https://kompastour.com/kz/rus/hotels/?state=${slug}`;
  const html = await fetch(catalogUrl, { headers }).then(response => response.text());
  const items = parseKompasCatalog(html, catalogUrl);
  const pages = Math.min(80, Math.max(1, ...[...html.matchAll(/[?&]page=(\d+)/gi)].map(match => Number(match[1]))));
  const hasAllTargets = () => targets.every(target => items.some(item => matchesName(item.name, target)));
  for (let page = 2; page <= pages && !hasAllTargets(); page += 6) {
    const batch = Array.from({ length: Math.min(6, pages - page + 1) }, (_, index) => page + index);
    const responses = await Promise.all(batch.map(pageNumber => fetch(`${catalogUrl}&page=${pageNumber}`, { headers }).then(response => response.text()).catch(() => '')));
    responses.forEach(response => items.push(...parseKompasCatalog(response, catalogUrl)));
  }
  return [...new Map(items.map(item => [item.link || `${item.name}:${item.images[0]}`, item])).values()];
}

async function kompasGallery(link: string, cover: string[]) {
  if (!link) return cover;
  try {
    const html = await fetch(link, { headers }).then(response => response.text());
    const gallery = absoluteImages(html, link).filter(image => image.includes('/useruploads/hotels/'));
  return [...new Set([...cover, ...gallery])];
  } catch { return cover; }
}

Deno.serve(async request => {
  if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
  if (!url || !key) return json({ error: 'Not configured' }, 503);
  const requestBody = await request.json().catch(() => ({})) as { cursor?: number; tourId?: string };
  const db = createClient(url, key, { auth: { persistSession: false } });
  const rows: Array<{ id: string; data: unknown }> = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from('app_tours').select('id,data').like('id', 'partner-%').eq('sync_status', 'active').range(from, from + 999);
    if (error) return json({ error: error.message }, 500);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  const candidates = rows.map(row => ({ row, tour: row.data as Tour })).filter(({ tour }) => Boolean(tour.partnerSource));
  const offers = [...new Map(candidates.map(item => [`${item.tour.partnerSource}:${item.tour.externalOfferId || item.tour.id}`, item])).values()];
  const eligible = offers.filter(item => Boolean(item.tour.sourceHotelId) || (item.tour.partnerSource === 'kompas' && Boolean(countrySlugs[item.tour.country])));
  const requestedCursor = Number.isFinite(requestBody.cursor) ? Math.max(0, Number(requestBody.cursor)) : Math.floor(Date.now() / 3600000) * 60;
  const cursor = eligible.length ? requestedCursor % eligible.length : 0;
  const selected = requestBody.tourId
    ? candidates.filter(item => item.tour.id === requestBody.tourId)
    : [...eligible.slice(cursor), ...eligible].slice(0, 60);
  if (requestBody.tourId && !selected.length) return json({ error: 'Partner tour not found' }, 404);
  const kompasCountries = [...new Set(selected.filter(item => item.tour.partnerSource === 'kompas').map(item => item.tour.country))];
  const kompasEntries = (await Promise.all(kompasCountries.map(async country => {
    const targets = selected.filter(item => item.tour.partnerSource === 'kompas' && item.tour.country === country).map(item => cleanName(item.tour.hotel));
    return [country, await kompasCatalog(country, targets)] as const;
  })));
  const catalogs = new Map(kompasEntries);
  let updated = 0;
  const matched = { samo: 0, kompasCatalog: 0 };
  const warnings: string[] = [];
  const results: Array<Record<string, unknown>> = [];
  for (const { tour } of selected) {
    let images: string[] = [];
    let sourceUrl: string | undefined;
    let category = 0;
    if (tour.partnerSource && tour.sourceHotelId) {
      images = await samoHotelImages(tour.partnerSource, tour.sourceHotelId, tour.sourceUrl).catch(error => {
        warnings.push(`${tour.partnerSource}:${tour.externalOfferId || tour.id}: ${error instanceof Error ? error.message : String(error)}`);
        return [];
      });
      if (images.length) matched.samo++;
    }
    if (tour.partnerSource === 'kompas' && !images.length) {
      const target = cleanName(tour.hotel);
      const match = (catalogs.get(tour.country) ?? []).find(item => matchesName(item.name, target));
      images = match ? await kompasGallery(match.link, match.images) : []; sourceUrl = match?.link; category = match?.category ?? 0;
      if (images.length) matched.kompasCatalog++;
    }
    if (!images.length) {
      images = [fallbackImage];
      warnings.push(`${tour.partnerSource}:${tour.externalOfferId || tour.id}: source returned no photos`);
    }
    images = [...new Set(images)];
    const next = { ...tour, images, rating: category || tour.rating || 0, reviews: tour.reviews || 0, syncedAt: new Date().toISOString(), ...(sourceUrl ? { sourceUrl } : {}) };
    const { error: saveError } = await db.from('app_tours').update({ data: next, updated_at: new Date().toISOString() }).eq('id', tour.id);
    if (saveError) {
      warnings.push(`${tour.partnerSource}:${tour.externalOfferId || tour.id}: ${saveError.message}`);
      continue;
    }
    await db.from('partner_tour_images').delete().eq('tour_id', tour.id);
    const { error: imageError } = await db.from('partner_tour_images').insert(images.map((image, index) => ({
      tour_id: tour.id,
      source: tour.partnerSource,
      external_tour_id: tour.externalOfferId || tour.id,
      image_url: image,
      is_main: index === 0,
      sort_order: index,
    })));
    if (imageError) warnings.push(`${tour.partnerSource}:${tour.externalOfferId || tour.id}: ${imageError.message}`);
    updated++;
    results.push({ id: tour.id, hotel: tour.hotel, source: tour.partnerSource, externalId: tour.externalOfferId, sourceUrl: sourceUrl || tour.sourceUrl, photoCount: images.length, cover: images[0], gallery: images.slice(1) });
    console.log(`[SYNC] Тур: ${tour.hotel}`);
    console.log(`[SYNC] Operator: ${tour.partnerSource}`);
    console.log(`[SYNC] External ID: ${tour.externalOfferId || tour.id}`);
    console.log(`[SYNC] Images found: ${images[0] === fallbackImage ? 0 : images.length}`);
    console.log(`[SYNC] Main image: ${images[0]}`);
    console.log(`[SYNC] Images saved: ${images.length}`);
    if (images[0] === fallbackImage) console.warn(`[SYNC] WARNING: Images not found for tour ${tour.id}. Using placeholder`);
  }
  const selectedBySource = Object.fromEntries([...new Set(selected.map(item => item.tour.partnerSource))].map(source => [source, selected.filter(item => item.tour.partnerSource === source).length]));
  const kompasCatalogs = Object.fromEntries(kompasEntries.map(([country, items]) => [country, items.length]));
  const kompasSamples = selected.filter(item => item.tour.partnerSource === 'kompas').slice(0, 5).map(item => ({
    country: item.tour.country, target: cleanName(item.tour.hotel), catalog: (catalogs.get(item.tour.country) ?? []).slice(0, 3).map(entry => entry.name),
  }));
  return json({ ok: true, cursor, nextCursor: eligible.length ? (cursor + selected.length) % eligible.length : 0, checked: selected.length, updated, totalOffers: eligible.length, selectedBySource, matched, kompasCatalogs, kompasSamples, warnings, results });
});
