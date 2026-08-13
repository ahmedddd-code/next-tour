export type Tour = {
  id: string;
  hotel: string;
  country: string;
  resort: string;
  city?: string;
  departureCity: string;
  airline?: string;
  dates: string;
  nights: number;
  meal: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  popularity: number;
  isHot: boolean;
  images: string[];
  description: string;
  included: string[];
  partnerSource?: string;
  externalOfferId?: string;
  sourceUrl?: string;
  syncedAt?: string;
  priceCheckedAt?: string;
  room?: string;
  tourProgram?: string;
  availability?: string;
  sourcePrice?: number;
  sourceCurrency?: string;
};

const photos = {
  maldives: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=1200&q=85',
  ],
  turkey: [
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85',
  ],
  thailand: [
    'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=85',
  ],
  dubai: [
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=1200&q=85',
  ],
  bali: [
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=85',
  ],
};

const included = ['Перелёт туда и обратно', 'Проживание в отеле', 'Питание по программе', 'Групповой трансфер', 'Медицинская страховка'];

export const tours: Tour[] = [
  { id: 'villa-park-maldives', hotel: 'Villa Park Sun Island 5★', country: 'Мальдивы', resort: 'Атолл Ари', departureCity: 'Алматы', dates: '14–22 сентября', nights: 8, meal: 'Всё включено', price: 1899000, oldPrice: 2240000, rating: 4.9, reviews: 318, popularity: 98, isHot: true, images: photos.maldives, description: 'Тропический остров с белоснежным пляжем, домашним рифом и просторными виллами. Идеален для спокойного отдыха вдвоём и незабываемого медового месяца.', included },
  { id: 'rixos-premium-belek', hotel: 'Rixos Premium Belek 5★', country: 'Турция', resort: 'Белек', city: 'Анталья', departureCity: 'Алматы', airline: 'Air Astana', dates: '18–25 сентября', nights: 7, meal: 'Ultra All Inclusive', price: 1425000, oldPrice: 1680000, rating: 4.8, reviews: 742, popularity: 100, isHot: true, images: photos.turkey, description: 'Премиальный семейный курорт на первой линии с собственным пляжем, огромной зелёной территорией, аквапарком и насыщенной программой для детей.', included },
  { id: 'shore-katathani', hotel: 'The Shore at Katathani 5★', country: 'Таиланд', resort: 'Пхукет', departureCity: 'Астана', dates: '2–12 октября', nights: 10, meal: 'Завтраки', price: 1768000, oldPrice: 2090000, rating: 4.9, reviews: 205, popularity: 91, isHot: true, images: photos.thailand, description: 'Уединённые виллы с бассейнами на одном из самых красивых пляжей Пхукета. Панорамные виды, приватность и первоклассный сервис.', included },
  { id: 'address-beach-dubai', hotel: 'Address Beach Resort 5★', country: 'ОАЭ', resort: 'Дубай', departureCity: 'Алматы', dates: '6–12 ноября', nights: 6, meal: 'Завтраки', price: 2184000, rating: 4.8, reviews: 529, popularity: 96, isHot: false, images: photos.dubai, description: 'Знаковый отель у пляжа JBR с панорамным бассейном на высоте и видом на колесо Ain Dubai. Для тех, кто любит город, море и современный комфорт.', included },
  { id: 'ayana-resort-bali', hotel: 'AYANA Resort Bali 5★', country: 'Индонезия', resort: 'Бали, Джимбаран', departureCity: 'Алматы', dates: '10–21 ноября', nights: 11, meal: 'Завтраки', price: 2649000, rating: 4.9, reviews: 611, popularity: 94, isHot: false, images: photos.bali, description: 'Легендарный курорт на скалах Джимбарана с приватным пляжем, десятками бассейнов и знаменитым Rock Bar. Настоящий тропический мир в одном отеле.', included },
  { id: 'centara-karon-phuket', hotel: 'Centara Karon Resort 4★', country: 'Таиланд', resort: 'Пхукет, Карон', departureCity: 'Астана', dates: '20–29 октября', nights: 9, meal: 'Завтраки', price: 1289000, oldPrice: 1490000, rating: 4.6, reviews: 403, popularity: 87, isHot: true, images: [...photos.thailand].reverse(), description: 'Комфортный курорт рядом с широким пляжем Карон. Несколько бассейнов, детский клуб и удобное расположение для прогулок по острову.', included },
  { id: 'next-marina-view-dubai', hotel: 'Marina View Hotel 4★', country: 'ОАЭ', resort: 'Дубай Марина', city: 'Дубай', departureCity: 'Алматы', dates: '8–14 октября', nights: 6, meal: 'Завтраки', price: 742000, rating: 4.5, reviews: 1842, popularity: 90, isHot: false, images: [...photos.dubai].reverse(), description: 'Современный городской отель рядом с набережной Dubai Marina, пляжем и торговым центром. Подходит для активного отдыха и первого знакомства с Дубаем.', included },
  { id: 'next-antalya-coast', hotel: 'Antalya Coast Resort 5★', country: 'Турция', resort: 'Лара', city: 'Анталья', departureCity: 'Алматы', dates: '12–19 сентября', nights: 7, meal: 'Всё включено', price: 615000, oldPrice: 710000, rating: 4.7, reviews: 967, popularity: 95, isHot: true, images: photos.turkey, description: 'Пляжный курорт в районе Лара с большой территорией, бассейнами и насыщенной семейной программой.', included },
  { id: 'next-phuket-bay', hotel: 'Phuket Bay Residence 4★', country: 'Таиланд', resort: 'Пхукет', city: 'Патонг', departureCity: 'Астана', dates: '4–13 ноября', nights: 9, meal: 'Завтраки', price: 928000, rating: 4.6, reviews: 1235, popularity: 88, isHot: false, images: photos.thailand, description: 'Уютный отель с видом на залив, удобным доступом к пляжу и главным достопримечательностям острова.', included },
  { id: 'next-kemer-garden', hotel: 'Kemer Garden Resort 5★', country: 'Турция', resort: 'Кемер', city: 'Анталья', departureCity: 'Алматы', airline: 'FlyArystan', dates: '21–28 сентября', nights: 7, meal: 'Ultra All Inclusive', price: 689000, oldPrice: 790000, rating: 4.8, reviews: 856, popularity: 96, isHot: true, images: [...photos.turkey].reverse(), description: 'Зелёный семейный отель между горами и морем с собственным пляжем, аквапарком и детским клубом.', included },
  { id: 'next-bodrum-aegean', hotel: 'Aegean Pearl Bodrum 5★', country: 'Турция', resort: 'Бодрум', city: 'Бодрум', departureCity: 'Астана', dates: '3–10 октября', nights: 7, meal: 'Всё включено', price: 824000, rating: 4.7, reviews: 614, popularity: 89, isHot: false, images: photos.turkey, description: 'Стильный курорт на побережье Эгейского моря с панорамным рестораном и спокойным приватным пляжем.', included },
  { id: 'next-hurghada-coral', hotel: 'Coral Beach Hurghada 4★', country: 'Египет', resort: 'Хургада', city: 'Хургада', departureCity: 'Алматы', dates: '16–24 октября', nights: 8, meal: 'Всё включено', price: 598000, oldPrice: 675000, rating: 4.5, reviews: 1104, popularity: 92, isHot: true, images: photos.dubai, description: 'Курорт на Красном море с домашним рифом, просторным пляжем и удобной программой отдыха для семей.', included },
  { id: 'next-sharm-reef', hotel: 'Sharm Reef Palace 5★', country: 'Египет', resort: 'Шарм-эль-Шейх', city: 'Шарм-эль-Шейх', departureCity: 'Астана', dates: '25 октября – 2 ноября', nights: 8, meal: 'Всё включено', price: 672000, rating: 4.7, reviews: 1389, popularity: 94, isHot: false, images: [...photos.dubai].reverse(), description: 'Отель у кораллового рифа с несколькими бассейнами, вечерними программами и красивой территорией.', included },
  { id: 'next-batumi-boulevard', hotel: 'Batumi Boulevard Hotel 4★', country: 'Грузия', resort: 'Батуми', city: 'Батуми', departureCity: 'Алматы', dates: '7–13 сентября', nights: 6, meal: 'Завтраки', price: 438000, rating: 4.6, reviews: 527, popularity: 82, isHot: false, images: photos.bali, description: 'Городской отель рядом с морем, старым Батуми и знаменитым Приморским бульваром.', included },
  { id: 'next-doha-bay', hotel: 'Doha Bay Hotel 5★', country: 'Катар', resort: 'Доха', city: 'Доха', departureCity: 'Алматы', dates: '11–17 ноября', nights: 6, meal: 'Завтраки', price: 786000, rating: 4.8, reviews: 731, popularity: 86, isHot: false, images: photos.dubai, description: 'Премиальный городской отель с видом на залив, бассейном и быстрым доступом к набережной Корниш.', included },
];

export const formatPrice = (price: number) => `${new Intl.NumberFormat('kk-KZ').format(price)} ₸`;
