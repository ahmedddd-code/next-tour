import type { Tour } from '../data/tours';

export function hasVerifiedHotelPhoto(tour: Tour) {
  if (!tour.partnerSource) return true;
  return tour.images.some(image => Boolean(image) && !image.includes('images.unsplash.com'));
}

export function publicTours(tours: Tour[]) {
  return tours.filter(hasVerifiedHotelPhoto);
}
