import type { Tour } from '../data/tours';

const normalizedImage = (image: string) => {
  try {
    const url = new URL(image, typeof window === 'undefined' ? 'https://next-tour.local' : window.location.origin);
    url.searchParams.delete('w');
    url.searchParams.delete('q');
    return url.toString();
  } catch {
    return image;
  }
};

const uniqueFallback = (tour: Tour) => `https://picsum.photos/seed/nexttour-${encodeURIComponent(tour.id)}/1200/800`;

const destinationPhotos: Record<string, string> = {
  'Мальдивы': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=82',
  'Турция': '/images/promo/istanbul.png',
  'Таиланд': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=82',
  'ОАЭ': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=82',
  'Индонезия': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=82',
  'Египет': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1400&q=82',
};

const hotelFallbacks = [
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=82',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=82',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=82',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=82',
];
const genericCityPhoto = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=82';

const stableIndex = (value: string) => [...value].reduce((total, character) => total + character.charCodeAt(0), 0);

export function completeTourGallery(tour: Tour) {
  const sourceImages = [...new Set((tour.images ?? []).filter(Boolean))];
  const destination = destinationPhotos[tour.country] ?? genericCityPhoto;
  const hotelImages = sourceImages.filter(image => normalizedImage(image) !== normalizedImage(destination));
  const start = stableIndex(tour.id) % hotelFallbacks.length;
  for (let index = 0; hotelImages.length < 2 && index < hotelFallbacks.length; index++) {
    const fallback = hotelFallbacks[(start + index) % hotelFallbacks.length];
    if (!hotelImages.some(image => normalizedImage(image) === normalizedImage(fallback))) hotelImages.push(fallback);
  }
  const gallery = [destination, ...hotelImages, ...sourceImages];
  return gallery.filter((image, index) => gallery.findIndex(candidate => normalizedImage(candidate) === normalizedImage(image)) === index);
}

/** Keeps catalog covers visually distinct without discarding real gallery photos. */
export function withUniqueTourCovers(tours: Tour[]) {
  const used = new Set<string>();
  return tours.map(tour => {
    const images = completeTourGallery(tour);
    const cover = images.find(image => !used.has(normalizedImage(image))) ?? uniqueFallback(tour);
    used.add(normalizedImage(cover));
    return { ...tour, images, coverImage: cover };
  });
}
