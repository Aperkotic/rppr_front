// Mock-данные отелей (без бэкенда)
const MOCK_HOTELS = [
  {
    id: 1,
    name: 'Гранд Отель Москва',
    location: 'Москва',
    description: 'Роскошный отель в центре Москвы рядом с Красной площадью',
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    rooms: [
      { id: 1, name: 'Стандарт', price_per_night: '5000' },
      { id: 2, name: 'Люкс', price_per_night: '12000' },
    ],
  },
  {
    id: 2,
    name: 'Морской Курорт',
    location: 'Сочи',
    description: 'Отель на берегу Черного моря с собственным пляжем',
    image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    rooms: [
      { id: 3, name: 'Комфорт', price_per_night: '7000' },
      { id: 4, name: 'Делюкс', price_per_night: '15000' },
    ],
  },
  {
    id: 3,
    name: 'Горный Лаунж',
    location: 'Красная Поляна',
    description: 'Уютный отель в горах с видом на Кавказ',
    image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
    rooms: [
      { id: 5, name: 'Стандарт', price_per_night: '6000' },
      { id: 6, name: 'Семейный', price_per_night: '9000' },
    ],
  },
  {
    id: 4,
    name: 'Сити Центр',
    location: 'Санкт-Петербург',
    description: 'Отель рядом с Эрмитажем и Невским проспектом',
    image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400',
    rooms: [
      { id: 7, name: 'Эконом', price_per_night: '3500' },
      { id: 8, name: 'Стандарт', price_per_night: '5500' },
    ],
  },
  {
    id: 5,
    name: 'Озеро Байкал',
    location: 'Байкал',
    description: 'Эко-отель на берегу самого глубокого озера мира',
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    rooms: [
      { id: 9, name: 'Комфорт', price_per_night: '8000' },
    ],
  },
  {
    id: 6,
    name: 'Золотое Кольцо',
    location: 'Суздаль',
    description: 'Исторический отель в древнерусском стиле',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
    rooms: [
      { id: 10, name: 'Стандарт', price_per_night: '4500' },
      { id: 11, name: 'Люкс', price_per_night: '10000' },
    ],
  },
  {
    id: 7,
    name: 'Северное Сияние',
    location: 'Мурманск',
    description: 'Отель с панорамными окнами для наблюдения за северным сиянием',
    image_url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400',
    rooms: [
      { id: 12, name: 'Панорама', price_per_night: '11000' },
    ],
  },
  {
    id: 8,
    name: 'Крымский Берег',
    location: 'Ялта',
    description: 'Курортный отель с видом на Черное море',
    image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
    rooms: [
      { id: 13, name: 'Стандарт', price_per_night: '5500' },
      { id: 14, name: 'С видом на море', price_per_night: '9500' },
    ],
  },
];

export const getHotels = async (params: URLSearchParams) => {
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 300));

  const page = parseInt(params.get('page') || '1');
  const pageSize = parseInt(params.get('page_size') || '10');
  const location = params.get('location') || '';
  const priceFrom = parseFloat(params.get('price_from') || '0');
  const priceTo = parseFloat(params.get('price_to') || '999999999');

  // Фильтрация
  let filtered = [...MOCK_HOTELS];

  if (location) {
    filtered = filtered.filter(h =>
      h.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (priceFrom > 0 || priceTo < 999999999) {
    filtered = filtered.filter(h => {
      const minPrice = Math.min(
        ...h.rooms.map(r => parseFloat(r.price_per_night))
      );
      return minPrice >= priceFrom && minPrice <= priceTo;
    });
  }

  // Пагинация
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = filtered.slice(start, end);

  return {
    total: filtered.length,
    hotels: paginated,
  };
};