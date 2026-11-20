/**
 Валідатор моделі «Датчик» 
 Перевіряє коректність усіх вхідних полів відповідно до вимог технічного завдання
 */

export const ALLOWED_ZONES = [
  'Цех №1',
  'Цех №2',
  'Охолоджувальний контур',
  'Трансформаторна підстанція',
  'Серверне приміщення'
];

export const ALLOWED_METRIC_TYPES = [
  'Температура',
  'Тиск',
  'Вібрація',
  'Вологість'
];

export const ALLOWED_STATUSES = [
  'active',
  'maintenance',
  'decommissioned'
];

// Формат серійного номера: SNS-XXXX-YY 
export const SERIAL_NUMBER_REGEX = /^SNS-[A-Za-z0-9]{4}-[A-Za-z0-9]{2}$/;

// Формат дати: YYYY-MM-DD
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Валідує дані датчика
  @param {Object} data - Об'єкт із полями датчика
  @param {Array} existingSensors - Масив існуючих датчиків для перевірки унікальності
  @param {string|number|null} currentSensorId - ID поточного датчика (при редагуванні)
  @returns {{ isValid: boolean, errors: Object }}
 */
export function validateSensor(data, existingSensors = [], currentSensorId = null) {
  const errors = {};

  // 1. Валідація serialNumber
  if (!data.serialNumber || typeof data.serialNumber !== 'string' || !data.serialNumber.trim()) {
    errors.serialNumber = 'Серійний номер є обов’язковим полем';
  } else {
    const serial = data.serialNumber.trim().toUpperCase();
    if (!SERIAL_NUMBER_REGEX.test(serial)) {
      errors.serialNumber = 'Серійний номер повинен відповідати формату SNS-XXXX-YY (наприклад, SNS-1042-AB)';
    } else {
      // Перевірка на унікальність
      const duplicate = existingSensors.find(sensor => 
        sensor.serialNumber.toUpperCase() === serial &&
        String(sensor.id) !== String(currentSensorId)
      );
      if (duplicate) {
        errors.serialNumber = `Датчик із серійним номером "${serial}" вже зареєстрований`;
      }
    }
  }

  // 2.Валідація name від 3 до 60 символів
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.name = 'Назва моделі є обов’язковою';
  } else {
    const nameTrimmed = data.name.trim();
    if (nameTrimmed.length < 3 || nameTrimmed.length > 60) {
      errors.name = 'Назва моделі повинна містити від 3 до 60 символів';
    }
  }

  // 3. Валідація zone
  if (!data.zone || typeof data.zone !== 'string' || !data.zone.trim()) {
    errors.zone = 'Необхідно обрати зону розміщення датчика';
  } else if (!ALLOWED_ZONES.includes(data.zone.trim())) {
    errors.zone = `Зона повинна бути однією з: ${ALLOWED_ZONES.join(', ')}`;
  }

  // 4. Валідація metricType
  if (!data.metricType || typeof data.metricType !== 'string' || !data.metricType.trim()) {
    errors.metricType = 'Необхідно обрати тип вимірюваної величини';
  } else if (!ALLOWED_METRIC_TYPES.includes(data.metricType.trim())) {
    errors.metricType = `Тип величини повинен бути одним з: ${ALLOWED_METRIC_TYPES.join(', ')}`;
  }

  // 5. Валідація criticalThreshold число від 0.1 до 999.9
  const threshold = typeof data.criticalThreshold === 'number' 
    ? data.criticalThreshold 
    : parseFloat(data.criticalThreshold);

  if (isNaN(threshold)) {
    errors.criticalThreshold = 'Граничний поріг повинен бути числовим значенням';
  } else if (threshold < 0.1 || threshold > 999.9) {
    errors.criticalThreshold = 'Граничний поріг повинен бути в діапазоні від 0.1 до 999.9';
  }

  // 6. Валідація status
  if (!data.status || typeof data.status !== 'string' || !data.status.trim()) {
    errors.status = 'Необхідно вказати статус датчика';
  } else if (!ALLOWED_STATUSES.includes(data.status.trim())) {
    errors.status = `Статус повинен бути одним з: ${ALLOWED_STATUSES.join(', ')}`;
  }

  // 7. Валідація installedAt (дата YYYY-MM-DD, не з майбутнього)
  if (!data.installedAt || typeof data.installedAt !== 'string' || !data.installedAt.trim()) {
    errors.installedAt = 'Дата встановлення є обов’язковою';
  } else if (!DATE_REGEX.test(data.installedAt.trim())) {
    errors.installedAt = 'Дата повинна бути у форматі РРРР-ММ-ДД (YYYY-MM-DD)';
  } else {
    const installedDate = new Date(data.installedAt.trim());
    if (isNaN(installedDate.getTime())) {
      errors.installedAt = 'Вказано некоректну дату';
    } else {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (installedDate > today) {
        errors.installedAt = 'Дата встановлення не може бути в майбутньому';
      }
    }
  }

  // 8. Валідація description до 300 символів
  if (data.description && typeof data.description === 'string') {
    if (data.description.trim().length > 300) {
      errors.description = 'Опис не повинен перевищувати 300 символів';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
