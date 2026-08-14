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

export const fallbackImages: Record<string, string> = {
  'Турция': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=78',
  'ОАЭ': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=78',
  'Таиланд': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=78',
  'Мальдивы': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=78',
  'Египет': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=78',
};

export const fallbackImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=78';

export async function stableId(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].slice(0, 12).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export const cleanText = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/&#8239;|&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
