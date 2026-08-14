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

/** Keeps catalog covers visually distinct without discarding real gallery photos. */
export function withUniqueTourCovers(tours: Tour[]) {
  const used = new Set<string>();
  return tours.map(tour => {
    const images = tour.images?.filter(Boolean) ?? [];
    const cover = images.find(image => !used.has(normalizedImage(image))) ?? uniqueFallback(tour);
    used.add(normalizedImage(cover));
    return cover === images[0] ? tour : { ...tour, images: [cover, ...images.filter(image => image !== cover)] };
  });
}
