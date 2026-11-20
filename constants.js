/** Константи та довідники предметної області телеметричних датчиків
 */

export const ZONES = [
  'Цех №1',
  'Цех №2',
  'Охолоджувальний контур',
  'Трансформаторна підстанція',
  'Серверне приміщення'
];

export const METRIC_TYPES = [
  'Температура',
  'Тиск',
  'Вібрація',
  'Вологість'
];

export const METRIC_UNITS = {
  'Температура': '°C',
  'Тиск': 'бар',
  'Вібрація': 'мм/с',
  'Вологість': '%'
};

export const STATUSES = [
  { value: 'active', label: 'Активний' },
  { value: 'maintenance', label: 'Калібрування/Обслуговування' },
  { value: 'decommissioned', label: 'Списаний' }
];

export const SORT_FIELDS = [
  { value: 'serialNumber', label: 'Серійний номер' },
  { value: 'name', label: 'Назва моделі' },
  { value: 'criticalThreshold', label: 'Критичний поріг' },
  { value: 'installedAt', label: 'Дата встановлення' }
];

/** Отримати одиницю вимірювання за типом
 */
export function getMetricUnit(type) {
  return METRIC_UNITS[type] || '';
}

/** Форматування дати для відображення в українському форматі
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${day}.${month}.${year}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}
