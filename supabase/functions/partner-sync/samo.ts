import { cleanText, fallbackImage, stableId, type PartnerTour, type SyncResult } from './types.ts';

type Source = { name: string; base: string; currency: string; currencyCode: 'KZT' | 'USD'; dateWindow: number; nightsTill: string };
const sources: Source[] = [
  { name: 'selfie', base: 'https://b2b.selfietravel.kz/search_tour', currency: '4', currencyCode: 'KZT', dateWindow: 30, nightsTill: '14' },
  { name: 'kompas', base: 'https://online.kz.kompastour.com/search_tour', currency: '1', currencyCode: 'KZT', dateWindow: 30, nightsTill: '14' },
  { name: 'funsun', base: 'https://b2b.fstravel.asia/search_tour', currency: '2', currencyCode: 'USD', dateWindow: 10, nightsTill: '10' },
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

async function parseRows(source: Source, html: string, departureCity: string, country: string, offerUrl: string, usdKzt: number) {
  const rows = [...html.matchAll(/<tr class="[^"]*price_info[\s\S]*?<\/tr>/gi)].slice(0, 18);
  const now = new Date().toISOString();
  return Promise.all(rows.map(async rowMatch => {
    const row = rowMatch[0];
    const attr = (name: string) => row.match(new RegExp(`data-${name}="([^"]*)"`, 'i'))?.[1] ?? '';
    const cellByClass = (className: string) => row.match(new RegExp(`<td[^>]*class="[^"]*${className}[^"]*"[^>]*>([\\s\\S]*?)<\\/td>`, 'i'))?.[1] ?? '';
    const hotelCell = row.match(/<td class="link-hotel">([\s\S]*?)<\/td>/i)?.[1] ?? '';
    const hotelText = cleanText(hotelCell.replace(/<span[\s\S]*?<\/span>/i, ''));
    const location = hotelText.match(/\(([^()]*)\)\s*$/)?.[1] ?? country;
    const hotel = hotelText.replace(/\s*\([^()]*\)\s*$/, '').trim();
    const date = row.match(/data-date="([^"]+)"/)?.[1] ?? '';
    const nights = Number(attr('nights')) || 7;
    const sourcePrice = Number(row.match(/data-converted-price-number="([\d.]+)"/)?.[1] ?? 0);
    const price = Math.round(sourcePrice * (source.currencyCode === 'USD' ? usdKzt : 1));
    const mealMarkup = cellByClass('hotel-meals') || row.match(/<td>\s*<span class="helpalt link">([\s\S]*?)<\/span>\s*<\/td>/i)?.[1] || '';
    const meal = cleanText(mealMarkup.replace(/<script[\s\S]*?<\/script>/i, '')) || 'По программе';
    const room = cleanText(cellByClass('hotel-room') || row.match(/<td>\s*<span class="">([\s\S]*?)<\/span>\s*<\/td>/i)?.[1] || '') || 'По программе тура';
    const tourProgram = cleanText(row.match(/<td class="tour">([\s\S]*?)<\/td>/i)?.[1] ?? '') || `${country} из ${departureCity}`;
    const transport = cleanText(row.match(/<div class="transport"><span class="name">([\s\S]*?)<\/span>/i)?.[1] ?? 'Эконом');
    const availability = /hotel_availability_Y/.test(row) ? 'Есть места' : /hotel_availability_R/.test(row) ? 'Места по запросу' : 'Наличие уточняется';
    const hotelSourceUrl = hotelCell.match(/href\s*=\s*["']([^"']+)["']/i)?.[1]?.replaceAll('&amp;', '&') || offerUrl;
    const offerKey = `${source.name}:${attr('cat-claim') || `${attr('hotel')}:${date}:${nights}:${sourcePrice}`}`;
    const id = `partner-${source.name}-${await stableId(offerKey)}`;
    const categoryWords: Record<string, number> = { onestar: 1, twostar: 2, threestar: 3, fourstar: 4, fivestar: 5 };
    const wordCategory = Object.entries(categoryWords).find(([word]) => hotel.toLowerCase().replace(/\s+/g, '').includes(word))?.[1];
    const rating = Number(hotel.match(/([1-5])\s*[★*]\s*(?:\([^)]*\))?$/)?.[1] ?? wordCategory ?? 0);
    return { id, hotel, country, resort: location, departureCity, dates: date, nights, meal, price, rating, reviews: 0, popularity: 80, isHot: true,
      images: [fallbackImage],
      description: `${hotel} — пакетный тур в ${location}, ${country}. Вылет из города ${departureCity}. Программа: ${tourProgram}. Размещение: ${room}. Питание: ${meal}. Перелёт: ${transport}. ${availability}.`,
      included: [`Перелёт: ${transport}`, `Проживание: ${room}`, `Питание: ${meal}`, availability], room, tourProgram, availability, sourcePrice, sourceCurrency: source.currencyCode,
      partnerSource: source.name, externalOfferId: offerKey, sourceHotelId: attr('hotel'), sourceUrl: hotelSourceUrl, syncedAt: now, priceCheckedAt: now } satisfies PartnerTour;
  })).then(tours => tours.filter(tour => tour.hotel && tour.price > 0));
}

async function syncSource(source: Source, usdKzt: number): Promise<SyncResult> {
  try {
    const initial = await fetch(source.base, { headers }).then(response => response.text());
    const departures = options(initial, 'TOWNFROMINC').filter(item => /Алматы|Астана|Шымкент|Актау|Актобе|Атырау|Караганда|Костанай|Уральск|Усть-Каменогорск|Семей|Петропавловск|Туркестан/.test(item.name));
    if (!departures.length) throw new Error('Departure cities not found');
    const hour = new Date().getUTCHours();
    const rotated = departures[hour % departures.length];
    const popular = ['\u0410\u043b\u043c\u0430\u0442\u044b', '\u0410\u0441\u0442\u0430\u043d\u0430']
      .map(city => departures.find(item => item.name.includes(city)))
      .filter((item): item is { id: string; name: string } => Boolean(item));
    const selectedDepartures = [...new Map([popular[hour % Math.max(popular.length, 1)], rotated].filter(Boolean).map(item => [item.id, item])).values()];
    const start = new Date(Date.now() + 2 * 86400000).toLocaleDateString('ru-RU');
    const end = new Date(Date.now() + source.dateWindow * 86400000).toLocaleDateString('ru-RU');
    const chunks = await Promise.all(selectedDepartures.map(async selected => {
      const dependencyUrl = `${source.base}?samo_action=TOWNFROMINC&TOWNFROMINC=${selected.id}&STATEINC=0&embed=1`;
      const dependency = await fetch(dependencyUrl, { headers }).then(response => response.text());
      const countries = dynamicOptions(dependency, 'STATEINC').slice(0, 28);
      return Promise.all(countries.map(async country => {
        const params = new URLSearchParams({ samo_action: 'PRICES', TOWNFROMINC: selected.id, STATEINC: country.id, CHECKIN_BEG: start, CHECKIN_END: end, NIGHTS_FROM: '3', NIGHTS_TILL: source.nightsTill, ADULT: '2', CHILD: '0', CURRENCY: source.currency, DOLOAD: '1', embed: '1' });
        const offerUrl = `${source.base}?${params}`;
        try { const script = await fetch(offerUrl, { headers }).then(response => response.text()); return parseRows(source, decodedResult(script), selected.name, country.name, offerUrl, usdKzt); } catch { return []; }
      }));
    }));
    return { source: source.name, tours: chunks.flat(2) };
  } catch (error) { return { source: source.name, tours: [], error: error instanceof Error ? error.message : 'Sync failed' }; }
}

async function getUsdKztRate() {
  try {
    const xml = await fetch('https://nationalbank.kz/rss/rates_all.xml', { headers: { Accept: 'application/xml' } }).then(response => response.text());
    const item = xml.match(/<item>[\s\S]*?<title>USD<\/title>[\s\S]*?<description>([\d.]+)<\/description>[\s\S]*?<quant>(\d+)<\/quant>[\s\S]*?<\/item>/i);
    const rate = Number(item?.[1]) / Number(item?.[2] || 1);
    if (Number.isFinite(rate) && rate > 100) return rate;
  } catch { /* Operator sync continues with a conservative fallback. */ }
  return 500;
}

export async function syncSamoSources() {
  const usdKzt = await getUsdKztRate();
  return Promise.all(sources.map(source => syncSource(source, usdKzt)));
}
