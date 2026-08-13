import { fallbackImage, included, stableId, type PartnerTour, type SyncResult } from './types.ts';

type Promotion = {
  id: string; hotelName: string; hotelImageUrl?: string; hotelRating?: number; hotelCategoryName?: string;
  currentPrice: number; oldPrice?: number; startDate: string; endDate: string; stayingDuration?: string;
  constructBookingUrl?: string; hotelDescriptionUrl?: string;
  hotelCountryId?: number; hotelLocationId?: number; currencyId?: number; adults?: number; child?: number;
};

type PromotionResponse = {
  packageTourPromotions?: Promotion[];
  departureLocation?: { name?: string };
  countries?: Array<{ id: number; name?: string }>;
  locations?: Array<{ id: number; name?: string }>;
  currencies?: Array<{ id: number; iso?: string }>;
};

export async function syncPegas(): Promise<SyncResult> {
  const source = 'pegas';
  try {
    const response = await fetch('https://kz.pegast.asia/Home/GetPackageTourPromotions', {
      method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Requested-With': 'XMLHttpRequest', Referer: 'https://kz.pegast.asia/', 'User-Agent': 'NextTour catalog sync/1.0' }, body: JSON.stringify({ countryId: null }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as PromotionResponse;
    const now = new Date().toISOString();
    const departureCity = data.departureLocation?.name ?? 'Алматы';
    const countries = new Map((data.countries ?? []).map(country => [country.id, country.name ?? 'Зарубежный тур']));
    const locations = new Map((data.locations ?? []).map(location => [location.id, location.name ?? 'Курорт']));
    const currencies = new Map((data.currencies ?? []).map(currency => [currency.id, currency.iso ?? 'KZT']));
    const promotions = (data.packageTourPromotions ?? []).slice(0, 350);
    const tours = await Promise.all(promotions.map(async offer => {
      const externalOfferId = `pegas:${offer.id}`;
      const start = new Date(offer.startDate);
      const end = new Date(offer.endDate);
      const nights = Number(offer.stayingDuration?.match(/\d+/)?.[0]) || Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
      const id = `partner-pegas-${await stableId(externalOfferId)}`;
      const country = countries.get(Number(offer.hotelCountryId)) ?? 'Зарубежный тур';
      const resort = locations.get(Number(offer.hotelLocationId)) ?? country;
      const sourceCurrency = currencies.get(Number(offer.currencyId)) ?? 'KZT';
      return { id, hotel: `${offer.hotelName}${offer.hotelCategoryName ? ` ${offer.hotelCategoryName}` : ''}`, country, resort, departureCity,
        dates: start.toLocaleDateString('ru-RU'), nights, meal: 'По программе', price: Math.round(offer.currentPrice), oldPrice: offer.oldPrice ? Math.round(offer.oldPrice) : undefined,
        rating: offer.hotelRating || Number(offer.hotelCategoryName?.match(/[1-5]/)?.[0]) || 0, reviews: 0, popularity: 85, isHot: true, images: [offer.hotelImageUrl || fallbackImage],
        description: `${offer.hotelName} — пакетный тур в ${resort}, ${country}. Вылет из города ${departureCity}, даты поездки ${start.toLocaleDateString('ru-RU')}–${end.toLocaleDateString('ru-RU')}, продолжительность ${nights} ночей. Размещение рассчитано для ${offer.adults ?? 2} взрослых${offer.child ? ` и ${offer.child} детей` : ''}.`,
        included: ['Перелёт по программе тура', `Проживание: ${nights} ночей`, `Размещение: ${offer.adults ?? 2} взрослых${offer.child ? ` и ${offer.child} детей` : ''}`],
        availability: 'Доступно к бронированию', sourcePrice: Math.round(offer.currentPrice), sourceCurrency, partnerSource: source, externalOfferId,
        sourceUrl: `https://kz.pegast.asia${offer.constructBookingUrl || offer.hotelDescriptionUrl || '/'}`, syncedAt: now, priceCheckedAt: now } satisfies PartnerTour;
    }));
    return { source, tours: tours.filter(tour => tour.price > 0) };
  } catch (error) { return { source, tours: [], error: error instanceof Error ? error.message : 'Sync failed' }; }
}
