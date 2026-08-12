export type KazakhstanCity = { name: string; latitude: number; longitude: number; popular?: boolean };

export const kazakhstanCities: KazakhstanCity[] = [
  { name: 'Астана', latitude: 51.1694, longitude: 71.4491, popular: true },
  { name: 'Алматы', latitude: 43.2389, longitude: 76.8897, popular: true },
  { name: 'Шымкент', latitude: 42.3155, longitude: 69.5869, popular: true },
  { name: 'Караганда', latitude: 49.8064, longitude: 73.0855 },
  { name: 'Актобе', latitude: 50.2839, longitude: 57.1669 },
  { name: 'Атырау', latitude: 47.0945, longitude: 51.9238 },
  { name: 'Актау', latitude: 43.6532, longitude: 51.1975 },
  { name: 'Костанай', latitude: 53.2144, longitude: 63.6246 },
  { name: 'Павлодар', latitude: 52.2873, longitude: 76.9674 },
  { name: 'Усть-Каменогорск', latitude: 49.9483, longitude: 82.6275 },
  { name: 'Семей', latitude: 50.4111, longitude: 80.2275 },
  { name: 'Тараз', latitude: 42.9000, longitude: 71.3667 },
  { name: 'Кызылорда', latitude: 44.8488, longitude: 65.4823 },
  { name: 'Уральск', latitude: 51.2278, longitude: 51.3865 },
  { name: 'Петропавловск', latitude: 54.8753, longitude: 69.1628 },
  { name: 'Кокшетау', latitude: 53.2833, longitude: 69.3833 },
  { name: 'Талдыкорган', latitude: 45.0156, longitude: 78.3739 },
  { name: 'Туркестан', latitude: 43.2973, longitude: 68.2518 },
];

export const popularCities = kazakhstanCities.filter(city => city.popular);

const genitiveNames: Record<string, string> = {
  Астана: 'Астаны', Алматы: 'Алматы', Шымкент: 'Шымкента', Караганда: 'Караганды', Актобе: 'Актобе', Атырау: 'Атырау', Актау: 'Актау', Костанай: 'Костаная', Павлодар: 'Павлодара', 'Усть-Каменогорск': 'Усть-Каменогорска', Семей: 'Семея', Тараз: 'Тараза', Кызылорда: 'Кызылорды', Уральск: 'Уральска', Петропавловск: 'Петропавловска', Кокшетау: 'Кокшетау', Талдыкорган: 'Талдыкоргана', Туркестан: 'Туркестана',
};

export const cityInGenitive = (city: string) => genitiveNames[city] ?? city;
