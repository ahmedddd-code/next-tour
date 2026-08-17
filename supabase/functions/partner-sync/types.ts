export type PartnerTour = {
  id: string; hotel: string; country: string; resort: string; city?: string; departureCity: string; airline?: string;
  dates: string; nights: number; meal: string; price: number; oldPrice?: number; rating: number; reviews: number;
  popularity: number; isHot: boolean; images: string[]; description: string; included: string[];
  partnerSource: string; externalOfferId: string; sourceUrl: string; syncedAt: string; priceCheckedAt: string;
  room?: string; tourProgram?: string; availability?: string; sourcePrice?: number; sourceCurrency?: string;
  sourceHotelId?: string;
  fuelSurcharge?: number; status?: 'active' | 'outdated'; dedupeKey?: string; bestPrice?: boolean;
  partnerOffers?: PartnerOffer[];
};

export type PartnerOffer = {
  source: string; price: number; currency: string; sourcePrice: number;
  externalOfferId: string; sourceUrl: string; availability: string; updatedAt: string;
  fuelSurcharge?: number;
};

export type SyncResult = { source: string; tours: PartnerTour[]; error?: string };

export const included = ['Перелёт туда и обратно', 'Проживание в отеле', 'Питание по программе', 'Трансфер', 'Медицинская страховка'];

export const fallbackImage = '/images/tour-placeholder.svg';

export async function stableId(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].slice(0, 12).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export const cleanText = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/&#8239;|&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
