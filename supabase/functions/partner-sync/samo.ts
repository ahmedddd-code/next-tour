import { cleanText, fallbackImage, fallbackImages, included, stableId, type PartnerTour, type SyncResult } from './types.ts';

type Source = { name: string; base: string; currency: string; dateWindow: number; nightsTill: string };
const sources: Source[] = [
  { name: 'selfie', base: 'https://b2b.selfietravel.kz/search_tour', currency: '4', dateWindow: 30, nightsTill: '14' },
  { name: 'kompas', base: 'https://online.kz.kompastour.com/search_tour', currency: '1', dateWindow: 30, nightsTill: '14' },
  { name: 'funsun', base: 'https://b2b.fstravel.asia/search_tour', currency: '2', dateWindow: 10, nightsTill: '10' },
];
const headers = { 'User-Agent': 'NextTour catalog sync/1.0', Accept: 'text/html,application/javascript' };

function options(html: string, name: string) {
  const block = html.match(new RegExp(`<select[^>]*name=["']${name}["'][^>]*>([\\s\\S]*?)<\\/select>`, 'i'))?.[1] ?? '';
  return [...block.matchAll(/<option[^>]*value=["']?([^"' >]+)["']?[^>]*>([\s\S]*?)<\/option>/gi)].map(match => ({ id: match[1], name: cleanText(match[2]) })).filter(item => item.id !== '0');
}

function dynamicOptions(script: string, control: string) {
  const block = script.match(new RegExp(`${control}\\)\\.addOptions\\(\\s*\\[([\\s\\S]*?)\\]\\s*\\)`, 'i'))?.[1] ?? '';
  return [...block.matchAll(/inc:\s*'([^']+)',\s*title:\s*'((?:\\'|[^'])*)'/g)].map(match => ({ id: match[1], name: match[2].replace(/\\'/g, "'") })).filter(item => item.id !== '0');
}

function decodedResult(script: string) {
  const quoted = script.match(/resultset\)\.ehtml\(("(?:\\.|[^"\\])*")\)/s)?.[1];
  if (!quoted) return '';
  try { return JSON.parse(quoted) as string; } catch { return ''; }
}

async function parseRows(source: Source, html: string, departureCity: string, country: string) {
  const rows = [...html.matchAll(/<tr class="[^"]*price_info[\s\S]*?<\/tr>/gi)].slice(0, 18);
  const now = new Date().toISOString();
  return Promise.all(rows.map(async rowMatch => {
    const row = rowMatch[0];
    const attr = (name: string) => row.match(new RegExp(`data-${name}="([^"]*)"`, 'i'))?.[1] ?? '';
    const hotelCell = row.match(/<td class="link-hotel">([\s\S]*?)<\/td>/i)?.[1] ?? '';
    const hotelText = cleanText(hotelCell.replace(/<span[\s\S]*?<\/span>/i, ''));
    const location = hotelText.match(/\(([^()]*)\)\s*$/)?.[1] ?? country;
    const hotel = hotelText.replace(/\s*\([^()]*\)\s*$/, '').trim();
    const date = row.match(/data-date="([^"]+)"/)?.[1] ?? '';
    const nights = Number(attr('nights')) || 7;
    const price = Number(row.match(/data-converted-price-number="([\d.]+)"/)?.[1] ?? 0);
    const meal = cleanText(row.match(/<td>\s*<span class="helpalt link">([\s\S]*?)<script/i)?.[1] ?? '') || 'По программе';
    const offerKey = `${source.name}:${attr('cat-claim') || `${attr('hotel')}:${date}:${nights}:${price}`}`;
    const id = `partner-${source.name}-${await stableId(offerKey)}`;
    const rating = Number(hotel.match(/([1-5])\*?\s*$/)?.[1] ?? 4.5);
    return { id, hotel, country, resort: location, departureCity, dates: date, nights, meal, price, rating, reviews: 0, popularity: 80, isHot: true,
      images: [fallbackImages[country] ?? fallbackImage], description: 'Актуальное пакетное предложение: перелёт, проживание и услуги по программе тура.', included,
      partnerSource: source.name, externalOfferId: offerKey, sourceUrl: source.base, syncedAt: now, priceCheckedAt: now } satisfies PartnerTour;
  })).then(tours => tours.filter(tour => tour.hotel && tour.price > 0));
}

async function syncSource(source: Source): Promise<SyncResult> {
  try {
    const initial = await fetch(source.base, { headers }).then(response => response.text());
    const departures = options(initial, 'TOWNFROMINC').filter(item => /Алматы|Астана|Шымкент|Актау|Актобе|Атырау|Караганда|Костанай|Уральск|Усть-Каменогорск|Семей|Петропавловск|Туркестан/.test(item.name));
    if (!departures.length) throw new Error('Departure cities not found');
    const rotated = departures[new Date().getUTCHours() % departures.length];
    const popular = ['\u0410\u043b\u043c\u0430\u0442\u044b', '\u0410\u0441\u0442\u0430\u043d\u0430']
      .map(city => departures.find(item => item.name.includes(city)))
      .filter((item): item is { id: string; name: string } => Boolean(item));
    const selectedDepartures = [...new Map([...popular, rotated].map(item => [item.id, item])).values()];
    const start = new Date(Date.now() + 2 * 86400000).toLocaleDateString('ru-RU');
    const end = new Date(Date.now() + source.dateWindow * 86400000).toLocaleDateString('ru-RU');
    const chunks = await Promise.all(selectedDepartures.map(async selected => {
      const dependencyUrl = `${source.base}?samo_action=TOWNFROMINC&TOWNFROMINC=${selected.id}&STATEINC=0&embed=1`;
      const dependency = await fetch(dependencyUrl, { headers }).then(response => response.text());
      const countries = dynamicOptions(dependency, 'STATEINC').slice(0, 28);
      return Promise.all(countries.map(async country => {
        const params = new URLSearchParams({ samo_action: 'PRICES', TOWNFROMINC: selected.id, STATEINC: country.id, CHECKIN_BEG: start, CHECKIN_END: end, NIGHTS_FROM: '3', NIGHTS_TILL: source.nightsTill, ADULT: '2', CHILD: '0', CURRENCY: source.currency, DOLOAD: '1', embed: '1' });
        try { const script = await fetch(`${source.base}?${params}`, { headers }).then(response => response.text()); return parseRows(source, decodedResult(script), selected.name, country.name); } catch { return []; }
      }));
    }));
    return { source: source.name, tours: chunks.flat(2) };
  } catch (error) { return { source: source.name, tours: [], error: error instanceof Error ? error.message : 'Sync failed' }; }
}

export async function syncSamoSources() { return Promise.all(sources.map(syncSource)); }
