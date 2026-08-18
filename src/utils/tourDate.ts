const months = ['январ', 'феврал', 'март', 'апрел', 'ма', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'];

export function matchesRequestedMonth(label: string, isoDate: string) {
  if (!isoDate) return true;
  const month = Number(isoDate.slice(5, 7)) - 1;
  const year = isoDate.slice(0, 4);
  const normalized = label.toLocaleLowerCase('ru-RU');
  return normalized.includes(months[month]) && (!/20\d{2}/.test(normalized) || normalized.includes(year));
}
