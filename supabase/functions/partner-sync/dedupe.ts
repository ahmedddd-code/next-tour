import { stableId, type PartnerOffer, type PartnerTour } from './types.ts';

const hotelNoise = /\b(?:hotel|resort|spa|apartments?|апарт(?:аменты)?|отель|гостиница|one|two|three|four|five|star)\b/gu;
export const normalize = (value: string | number | undefined) => String(value ?? '').normalize('NFKD')
  .toLocaleLowerCase('ru').replace(/[\u0300-\u036f]/g, '').replace(hotelNoise, ' ')
  .replace(/[\s\-/,.*★.]+/g, '').replace(/[^\p{L}\p{N}]/gu, '');

const similarHotel = (left: string, right: string) => left === right
  || (Math.min(left.length, right.length) >= 6 && (left.includes(right) || right.includes(left)));
const available = (value = '') => !/(нет мест|недоступ|unavailable|sold out)/iu.test(value);
const validImage = (value: string) => {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && /\.(?:jpe?g|png|webp)(?:$|\?)/i.test(url.pathname + url.search); }
  catch { return false; }
};

type Prepared = { tour: PartnerTour; fields: string[] };
const prepare = (tour: PartnerTour): Prepared => ({ tour, fields: [tour.hotel, tour.country, tour.resort, tour.dates, tour.nights, tour.meal, tour.rating, tour.departureCity].map(normalize) });
function isDuplicate(left: Prepared, right: Prepared) {
  if (!similarHotel(left.fields[0], right.fields[0])) return false;
  const matches = left.fields.reduce((total, value, index) => total + (value && value === right.fields[index] ? 1 : 0), 0);
  return matches >= 6;
}

function toOffer(tour: PartnerTour): PartnerOffer {
  return { source: tour.partnerSource, price: tour.price, currency: 'KZT', sourcePrice: tour.sourcePrice ?? tour.price,
    externalOfferId: tour.externalOfferId, sourceUrl: tour.sourceUrl, availability: tour.availability ?? 'Доступно',
    updatedAt: tour.priceCheckedAt, ...(tour.fuelSurcharge ? { fuelSurcharge: tour.fuelSurcharge } : {}) };
}

async function mergeGroup(group: Prepared[]) {
  const bookable = group.map(item => item.tour).filter(tour => tour.price > 0 && available(tour.availability));
  if (!bookable.length) return null;
  const bySource = new Map<string, PartnerTour>();
  for (const tour of bookable) {
    const current = bySource.get(tour.partnerSource);
    if (!current || tour.price < current.price) bySource.set(tour.partnerSource, tour);
  }
  const choices = [...bySource.values()].sort((a, b) => a.price - b.price);
  const best = choices[0];
  const fields = prepare(best).fields;
  const dedupeKey = fields.join('|');
  const images = [...new Set(best.images.filter(validImage))];
  const id = `partner-merged-${await stableId(dedupeKey)}`;
  return { ...best, id, price: best.price, oldPrice: choices.length > 1 ? choices[1].price : best.oldPrice,
    images: images.length ? images : ['/images/tour-placeholder.svg'], status: 'active', dedupeKey, bestPrice: true, partnerOffers: choices.map(toOffer),
    syncedAt: new Date().toISOString(), priceCheckedAt: best.priceCheckedAt } satisfies PartnerTour;
}

export async function mergeDuplicateTours(tours: PartnerTour[]) {
  const buckets = new Map<string, Prepared[]>();
  for (const tour of tours) {
    const item = prepare(tour);
    const key = [item.fields[1], item.fields[3], item.fields[4]].join('|');
    const bucket = buckets.get(key) ?? [];
    bucket.push(item); buckets.set(key, bucket);
  }
  const groups: Prepared[][] = [];
  for (const bucket of buckets.values()) {
    for (const item of bucket) {
      const match = groups.find(group => isDuplicate(group[0], item));
      if (match) match.push(item); else groups.push([item]);
    }
  }
  const merged = await Promise.all(groups.map(mergeGroup));
  return merged.filter((tour): tour is PartnerTour => Boolean(tour));
}
