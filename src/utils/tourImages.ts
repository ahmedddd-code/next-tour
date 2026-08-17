import type { Tour } from '../data/tours';

const normalizedImage = (image: string) => {
  try {
    const url = new URL(image, typeof window === 'undefined' ? 'https://next-tour.local' : window.location.origin);
    url.searchParams.delete('w'); url.searchParams.delete('q');
    return url.toString();
  } catch { return image; }
};

const curatedGalleries: Record<string, string[]> = {
  'villa-park-maldives': [
    'https://maldives.ru/upload/resize_cache/iblock/bc5/nxv416m7su193l65dyf2itd5c4q1e5tb/1500_1000_2/2ae44ce7f1b0a1477f6d8bf2ebc5171f.jpg',
    'https://images.trvl-media.com/lodging/3000000/2920000/2917900/2917878/af24f122.jpg',
    'https://storagelargeimg.imgix.net/villa-park-sun-island-maldives-09.jpg',
  ],
  'rixos-premium-belek': [
    'https://tourboxantalya.com/wp-content/uploads/2015/04/general-view-1.jpg',
    'https://bilyanagolf.com/files/images/webp/r_279_rixos-002.webp',
    'https://freechildplacesholidays.co.uk/wp-content/uploads/2019/01/ACC_030114_TUR_011WebOriginalCompressed.jpg',
  ],
  'shore-katathani': ['https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1600&q=85'],
  'address-beach-dubai': ['https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1600&q=85'],
  'ayana-resort-bali': ['https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=1600&q=85'],
  'centara-karon-phuket': ['https://tools.vakantiediscounter.nl/images/cache/1200/f630a884dd97fd954bacf013acec31adead0f0336c209ebcb0bef3a1af97fe9d.jpg'],
  'next-marina-view-dubai': ['https://soleazur.rs/public/uploads/0000/1/2021/10/15/crowne-plaza-marina-dubai-2.jpg'],
  'next-antalya-coast': ['https://foto.piletid.eu/hotell-partnerilt-meie/1585_1/turgi-lara-nirvana-cosmopolitan-1__7.jpg'],
  'next-phuket-bay': ['https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1600&q=85'],
  'next-kemer-garden': ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=85'],
  'next-bodrum-aegean': ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85'],
  'next-hurghada-coral': [
    'https://dcontent.inviacdn.net/shared/img/web-1200x1024/2021/2/2/d2/27469437-marriott-beach-resort.jpg',
    'https://redseahotels.com/wp-content/uploads/2023/02/Hurghada-is-a-prime-holiday-destination-in-egypt-right-by-the-red-sea-with-all-inclusive-hotels.jpg',
    'https://hurghadatransfer.de/images/hurghada-airport-transfer-hurghada-hotels.webp',
  ],
  'next-sharm-reef': [
    'https://www.tourdom.ru/hotline/upload/medialibrary/d9b/d9b1c23c3156b95a1b4c6a4a5978f9c3.jpg',
    'https://s.content4travel.com/pim-itk/SSHCOBE_01_494429469e.jpg',
    'https://static.promovacances.com/photos/vacances-egypte/sharm-el-sheikh/vue-panoramique-pickalbatros-royal-grand-resort-_844351_panohd.jpg',
  ],
  'next-batumi-boulevard': [
    'https://j1ad0nr4fkte9vkm.public.blob.vercel-storage.com/blog/batumi-attractions-rA2nRJpxV19KvCrJ8DLGvOlPXXuBpQ.webp',
    'https://sakhva-travel.com/images/batumi-tour.webp?v=2',
    'https://jaguar-tr.com/assets/images/destinations/top-batumi-v2.webp',
  ],
  'next-doha-bay': [
    'https://cdn.trailfinders.com/jboyfijnpw_aerial_02_v2_1500x1500.jpg',
    'https://secure.s.forbestravelguide.com/img/properties/intercontinental-doha/extra-large/intercontinental-doha-aerial.jpg',
    'https://dq-be.iolcloud.com/cdn/hotels/hotel-deals/images/InterContinental-Doha-Hotel-Deals.jpg',
  ],
};

const destinationFallbacks: Record<string, string[]> = {
  'Мальдивы': ['https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1400&q=82'],
  'Турция': ['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=82'],
  'Таиланд': ['https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=82'],
  'ОАЭ': ['https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1400&q=82'],
  'Индонезия': ['https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=1400&q=82'],
  'Египет': ['https://www.barcelo.com/guia-turismo/wp-content/uploads/2024/11/hurghada-3-768x432.jpg'],
  'Грузия': ['https://weltfox.com/images/posts/caucasus/georgia/georgia-travel-guide/batumi-boulevard-black-sea-coast-georgia.webp'],
  'Катар': ['https://world-travel.uz/uploads/infos/new/big_810c61014b76973a6e5ffabf996369bf.jpg'],
};

const hotelFallbacks = [
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=82',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=82',
];

export function completeTourGallery(tour: Tour) {
  const supplied = (tour.images ?? []).filter(Boolean);
  if (tour.partnerSource) return [...new Set(supplied.length ? supplied : ['/images/tour-placeholder.svg'])];
  const curated = curatedGalleries[tour.id] ?? [];
  const destination = destinationFallbacks[tour.country] ?? [];
  const gallery = curated.length >= 3 ? curated : [...curated, ...supplied, ...destination, ...hotelFallbacks];
  return gallery.filter((image, index) => gallery.findIndex(candidate => normalizedImage(candidate) === normalizedImage(image)) === index).slice(0, 3);
}

/** Preserves real supplied photos and never replaces them with random placeholders. */
export function withUniqueTourCovers(tours: Tour[]) {
  return tours.map(tour => {
    const images = completeTourGallery(tour);
    return { ...tour, images, coverImage: images[0] };
  });
}
