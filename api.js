/**
  Автономний сервіс API для роботи з телеметричними датчиками.
  Забезпечує повноцінну роботу клієнтського застосунку без необхідності запуску окремого сервера.
  Зберігає дані у локальному сховищі браузера (localStorage) з імітацією асинхронних REST-запитів.
 */
import { validateSensor } from '../utils/sensorValidator';

const STORAGE_KEY = 'telemetry_sensors_data';

// Початковий набір даних для первинної ініціалізації
const INITIAL_SENSORS = [
  {
    id: "1710000001",
    serialNumber: "SNS-1042-AB",
    name: "Термодатчик реактора TR-10",
    zone: "Цех №1",
    metricType: "Температура",
    criticalThreshold: 85.5,
    status: "active",
    description: "Основний температурний датчик на першому контурі хімічного реактора.",
    installedAt: "2024-03-15"
  },
  {
    id: "1710000002",
    serialNumber: "SNS-2034-CD",
    name: "Вібродатчик головної турбіни VT-2",
    zone: "Цех №2",
    metricType: "Вібрація",
    criticalThreshold: 4.8,
    status: "active",
    description: "Контроль радіальної вібрації підшипникового вузла турбіни.",
    installedAt: "2024-01-20"
  },
  {
    id: "1710000003",
    serialNumber: "SNS-3011-EF",
    name: "Манометр високого тиску MP-500",
    zone: "Охолоджувальний контур",
    metricType: "Тиск",
    criticalThreshold: 16.5,
    status: "maintenance",
    description: "Планове калібрування сенсора тиску теплоносія.",
    installedAt: "2023-11-10"
  },
  {
    id: "1710000004",
    serialNumber: "SNS-4089-GH",
    name: "Гігрометр прецизійний HS-70",
    zone: "Серверне приміщення",
    metricType: "Вологість",
    criticalThreshold: 65.0,
    status: "active",
    description: "Моніторинг вологості повітря біля серверних стійок А та Б.",
    installedAt: "2024-02-01"
  },
  {
    id: "1710000005",
    serialNumber: "SNS-5022-KL",
    name: "Термометр силового трансформатора T-4",
    zone: "Трансформаторна підстанція",
    metricType: "Температура",
    criticalThreshold: 95.0,
    status: "active",
    description: "Датчик контролю температури масла в головному баку трансформатора.",
    installedAt: "2023-08-14"
  },
  {
    id: "1710000006",
    serialNumber: "SNS-6077-MN",
    name: "Датчик тиску компресора PK-12",
    zone: "Цех №1",
    metricType: "Тиск",
    criticalThreshold: 8.2,
    status: "decommissioned",
    description: "Застаріла модель. Демонтовано після випрацювання ресурсу.",
    installedAt: "2022-05-19"
  }
];

// Імітація мережевої затримки для реалістичного показу індикаторів завантаження 
const simulateDelay = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

/**
 Отримати весь список датчиків із localStorage
 */
function getStoredSensors() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SENSORS));
      return [...INITIAL_SENSORS];
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Помилка читання localStorage:', error);
    return [...INITIAL_SENSORS];
  }
}

/**
 Зберегти оновлений список у localStorage
 */
function saveStoredSensors(sensors) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sensors));
  } catch (error) {
    console.error('Помилка запису в localStorage:', error);
  }
}

export const sensorApi = {
  /**
   Отримати список датчиків із фільтрацією та сортуванням
   GET /api/sensors
   */
  async getSensors(params = {}) {
    await simulateDelay(100);
    let sensors = getStoredSensors();

    const { search, zone, status, sortBy, sortOrder = 'asc' } = params;

    // Пошук за підрядком у serialNumber та name
    if (search && search.trim() !== '') {
      const searchLower = search.trim().toLowerCase();
      sensors = sensors.filter(sensor => 
        (sensor.serialNumber && sensor.serialNumber.toLowerCase().includes(searchLower)) ||
        (sensor.name && sensor.name.toLowerCase().includes(searchLower))
      );
    }

    // Фільтр за зоною
    if (zone && zone.trim() !== '') {
      sensors = sensors.filter(sensor => sensor.zone === zone.trim());
    }

    // Фільтр за статусом
    if (status && status.trim() !== '') {
      sensors = sensors.filter(sensor => sensor.status === status.trim());
    }

    // Сортування за полями: serialNumber, name, criticalThreshold, installedAt
    if (sortBy) {
      const orderFactor = sortOrder.toLowerCase() === 'desc' ? -1 : 1;

      sensors.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'criticalThreshold') {
          return (Number(valA) - Number(valB)) * orderFactor;
        }

        if (sortBy === 'installedAt') {
          return (new Date(valA).getTime() - new Date(valB).getTime()) * orderFactor;
        }

        const strA = (valA || '').toString().toLowerCase();
        const strB = (valB || '').toString().toLowerCase();
        return strA.localeCompare(strB, 'uk') * orderFactor;
      });
    }

    return sensors;
  },

  /**
    Отримати датчик за ID
    GET /api/sensors/:id
   */
  async getSensorById(id) {
    await simulateDelay(100);
    const sensors = getStoredSensors();
    const sensor = sensors.find(s => String(s.id) === String(id));

    if (!sensor) {
      const error = new Error(`Датчик з ідентифікатором "${id}" не знайдено`);
      error.status = 404;
      throw error;
    }

    return sensor;
  },

  /**
   Створити новий датчик
   POST /api/sensors
   */
  async createSensor(sensorData) {
    await simulateDelay(150);
    const sensors = getStoredSensors();

    // Сувора валідація полів
    const validation = validateSensor(sensorData, sensors, null);
    if (!validation.isValid) {
      const error = new Error('Помилка валідації вхідних даних');
      error.status = 400;
      error.errors = validation.errors;
      throw error;
    }

    const newSensor = {
      id: Date.now().toString(),
      serialNumber: sensorData.serialNumber.trim().toUpperCase(),
      name: sensorData.name.trim(),
      zone: sensorData.zone.trim(),
      metricType: sensorData.metricType.trim(),
      criticalThreshold: parseFloat(sensorData.criticalThreshold),
      status: sensorData.status.trim(),
      description: sensorData.description ? sensorData.description.trim() : '',
      installedAt: sensorData.installedAt.trim()
    };

    sensors.push(newSensor);
    saveStoredSensors(sensors);

    return newSensor;
  },

  /**
    Оновити існуючий датчик
    PUT /api/sensors/:id
   */
  async updateSensor(id, sensorData) {
    await simulateDelay(150);
    const sensors = getStoredSensors();
    const index = sensors.findIndex(s => String(s.id) === String(id));

    if (index === -1) {
      const error = new Error(`Датчик з ідентифікатором "${id}" не знайдено`);
      error.status = 404;
      throw error;
    }

    // Валідація з перевіркою унікальності серійного номера
    const validation = validateSensor(sensorData, sensors, id);
    if (!validation.isValid) {
      const error = new Error('Помилка валідації вхідних даних');
      error.status = 400;
      error.errors = validation.errors;
      throw error;
    }

    const updatedSensor = {
      ...sensors[index],
      serialNumber: sensorData.serialNumber.trim().toUpperCase(),
      name: sensorData.name.trim(),
      zone: sensorData.zone.trim(),
      metricType: sensorData.metricType.trim(),
      criticalThreshold: parseFloat(sensorData.criticalThreshold),
      status: sensorData.status.trim(),
      description: sensorData.description ? sensorData.description.trim() : '',
      installedAt: sensorData.installedAt.trim()
    };

    sensors[index] = updatedSensor;
    saveStoredSensors(sensors);

    return updatedSensor;
  },

  /**
    Видалити датчик
    DELETE /api/sensors/:id
   */
  async deleteSensor(id) {
    await simulateDelay(120);
    const sensors = getStoredSensors();
    const index = sensors.findIndex(s => String(s.id) === String(id));

    if (index === -1) {
      const error = new Error(`Датчик з ідентифікатором "${id}" не знайдено`);
      error.status = 404;
      throw error;
    }

    const [deletedSensor] = sensors.splice(index, 1);
    saveStoredSensors(sensors);

    return {
      message: 'Датчик успішно видалено',
      deletedSensor
    };
  },

  /**
    Скинути дані до початкових тестових
   */
  resetToDefault() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SENSORS));
    return [...INITIAL_SENSORS];
  }
};
