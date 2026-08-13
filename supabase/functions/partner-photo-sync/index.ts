import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.0';

type Tour = {
  id: string; hotel: string; country: string; partnerSource?: string; sourceHotelId?: string;
  images: string[]; syncedAt?: string;
};

const url = Deno.env.get('SUPABASE_URL');
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const headers = { 'User-Agent': 'NextTour partner photo sync/1.0', 'X-Requested-With': 'XMLHttpRequest' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const cleanName = (value: string) => value.toLowerCase().replace(/&amp;/g, '&').replace(/\([^)]*\)/g, '').replace(/\b(?:hotel|resort|spa|apartments?)\b/g, '').replace(/\d\s*\*|[^\p{L}\p{N}]+/gu, ' ').trim();
const absoluteImages = (text: string, base: string) => [...new Set([...text.matchAll(/(?:src|href|url\()["']?([^"')]+\.(?:jpe?g|webp|png)(?:\?[^"') ]*)?)/gi)].map(match => {
  try { return new URL(match[1].replaceAll('\\/', '/'), base).href; } catch { return ''; }
}).filter(image => image && !/logo|icon|flag|banner|hotelparam/i.test(image)))].slice(0, 8);

async function selfieImages(hotelId: string) {
  const endpoint = `https://b2b.selfietravel.kz/hotels?samo_action=info&embed=${encodeURIComponent(hotelId)}&HOTELINC=${encodeURIComponent(hotelId)}`;
  const script = await fetch(endpoint, { headers: { ...headers, Referer: 'https://b2b.selfietravel.kz/search_tour' } }).then(response => response.text());
  return absoluteImages(script, 'https://b2b.selfietravel.kz/');
}

const countrySlugs: Record<string, string> = {
  'Австрия': 'austria', 'Азербайджан': 'azerbaijan', 'Армения': 'armenia', 'Грузия': 'georgia', 'Египет': 'egypt',
  'ОАЭ': 'uae', 'Турция': 'turkey', 'Таиланд': 'thailand', 'Вьетнам': 'vietnam', 'Мальдивы': 'maldives',
  'Китай': 'china', 'Индонезия': 'indonesia', 'Катар': 'qatar', 'Шри-Ланка': 'sri_lanka', 'Черногория': 'montenegro',
  'Казахстан': 'kazakhstan', 'Кыргызстан': 'kyrgyzstan', 'Маврикий': 'mauritius', 'Венгрия': 'hungary', 'Бразилия': 'brazil',
  'Аргентина': 'argentina', 'Великобритания': 'great_britain', 'Индия': 'india', 'Кипр': 'cyprus', 'Сейшелы': 'seychelles',
  'Италия': 'italy', 'Испания': 'spain', 'Греция': 'greece', 'Болгария': 'bulgaria', 'Албания': 'albania',
  'Бахрейн': 'bahrain', 'Саудовская Аравия': 'saudi_arabia', 'Узбекистан': 'uzbekistan', 'Япония': 'japan',
  'Занзибар (Танзания)': 'tanzania', 'Танзания': 'tanzania', 'Малайзия': 'malaysia', 'Сингапур': 'singapore',
};

async function kompasCatalog(country: string) {
  const slug = countrySlugs[country];
  if (!slug) return [] as Array<{ name: string; images: string[] }>;
  const catalogUrl = `https://kompastour.com/kz/rus/hotels/?state=${slug}`;
  const html = await fetch(catalogUrl, { headers }).then(response => response.text());
  const blocks = [...html.matchAll(/<div class="block">([\s\S]*?)<div class="hotel_btn"/gi)];
  return blocks.map(match => {
    const block = match[1];
    const name = block.match(/class="hotel_name"[^>]*>([\s\S]*?)<\/a>/i)?.[1]?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
    const path = block.match(/background-image:\s*url\(([^)]+)\)/i)?.[1]?.replace(/["']/g, '') ?? '';
    const link = block.match(/href=["']([^"']+)["'][^>]*class="hotel_name"/i)?.[1] ?? '';
    return { name: cleanName(name), images: path ? [new URL(path, catalogUrl).href] : [], link: link ? new URL(link, catalogUrl).href : '' };
  }).filter(item => item.name && item.images.length);
}

async function kompasGallery(link: string, cover: string[]) {
  if (!link) return cover;
  try {
    const html = await fetch(link, { headers }).then(response => response.text());
    const gallery = absoluteImages(html, link).filter(image => image.includes('/useruploads/hotels/'));
    return [...new Set([...cover, ...gallery])].slice(0, 8);
  } catch { return cover; }
}

Deno.serve(async request => {
  if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
  if (!url || !key) return json({ error: 'Not configured' }, 503);
  const db = createClient(url, key, { auth: { persistSession: false } });
  const rows: Array<{ id: string; data: unknown }> = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from('app_tours').select('id,data').like('id', 'partner-%').range(from, from + 999);
    if (error) return json({ error: error.message }, 500);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  const candidates = rows.map(row => ({ row, tour: row.data as Tour })).filter(({ tour }) =>
    ['selfie', 'kompas'].includes(tour.partnerSource ?? '') && tour.images?.every(image => image.includes('images.unsplash.com'))
  );
  const hour = new Date().getUTCHours();
  const rotate = <T>(items: T[], count: number) => [...items.slice((hour * count) % Math.max(items.length, 1)), ...items].slice(0, count);
  const selected = [
    ...rotate(candidates.filter(item => item.tour.partnerSource === 'selfie' && item.tour.sourceHotelId), 40),
    ...rotate(candidates.filter(item => item.tour.partnerSource === 'kompas' && countrySlugs[item.tour.country]), 40),
  ];
  const kompasCountries = [...new Set(selected.filter(item => item.tour.partnerSource === 'kompas').map(item => item.tour.country))];
  const kompasEntries = (await Promise.all(kompasCountries.map(async country => [country, await kompasCatalog(country)] as const)));
  const catalogs = new Map(kompasEntries);
  let updated = 0;
  for (const { tour } of selected) {
    let images: string[] = [];
    let sourceUrl: string | undefined;
    if (tour.partnerSource === 'selfie' && tour.sourceHotelId) images = await selfieImages(tour.sourceHotelId).catch(() => []);
    if (tour.partnerSource === 'kompas') {
      const target = cleanName(tour.hotel);
      const match = (catalogs.get(tour.country) ?? []).find(item => item.name === target || item.name.includes(target) || target.includes(item.name));
      images = match ? await kompasGallery(match.link, match.images) : []; sourceUrl = match?.link;
    }
    if (!images.length) continue;
    const next = { ...tour, images, ...(sourceUrl ? { sourceUrl } : {}) };
    const { error: saveError } = await db.from('app_tours').update({ data: next }).eq('id', tour.id);
    if (!saveError) updated++;
  }
  return json({ ok: true, checked: selected.length, updated, remaining: Math.max(0, candidates.length - updated) });
});
