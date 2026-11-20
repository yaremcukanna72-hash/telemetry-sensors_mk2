<template>
  <div class="sensor-list-page">
    <!-- Верхня панель дій -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Реєстр телеметричних датчиків</h1>
        <p class="page-subtitle">Облік, моніторинг та конфігурація параметрів виробничої інфраструктури</p>
      </div>
      <router-link to="/sensors/new" class="btn btn-primary">
        <span>+</span> Додати датчик
      </router-link>
    </div>

    <!-- Панель фільтрації, пошуку та сортування -->
    <div class="card filter-card">
      <div class="filter-grid">
        <!-- Пошук за назвою або серійним номером -->
        <div class="filter-item search-box">
          <label class="filter-label">Пошук:</label>
          <div class="input-with-icon">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="form-control"
              v-model="filters.search"
              placeholder="Пошук за назвою чи серійним номером..."
              @input="onFilterChange"
            />
          </div>
        </div>

        <!-- Фільтр за технологічною зоною -->
        <div class="filter-item">
          <label class="filter-label">Зона розміщення:</label>
          <select class="form-select" v-model="filters.zone" @change="onFilterChange">
            <option value="">Всі зони</option>
            <option v-for="zone in ZONES" :key="zone" :value="zone">{{ zone }}</option>
          </select>
        </div>

        <!-- Фільтр за статусом -->
        <div class="filter-item">
          <label class="filter-label">Статус датчика:</label>
          <select class="form-select" v-model="filters.status" @change="onFilterChange">
            <option value="">Всі статуси</option>
            <option v-for="st in STATUSES" :key="st.value" :value="st.value">{{ st.label }}</option>
          </select>
        </div>

        <!-- Поле сортування -->
        <div class="filter-item">
          <label class="filter-label">Сортувати за:</label>
          <div class="sort-controls">
            <select class="form-select" v-model="filters.sortBy" @change="onFilterChange">
              <option v-for="sf in SORT_FIELDS" :key="sf.value" :value="sf.value">{{ sf.label }}</option>
            </select>
            <button
              type="button"
              class="btn btn-secondary btn-direction"
              :title="filters.sortOrder === 'asc' ? 'За зростанням (натисніть для спадання)' : 'За спаданням (натисніть для зростання)'"
              @click="toggleSortOrder"
            >
              {{ filters.sortOrder === 'asc' ? '▲ Зрост.' : '▼ Спад.' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Кнопка скидання фільтрів та лічильник -->
      <div class="filter-footer">
        <span class="results-count">
          Знайдено пристроїв: <strong>{{ sensors.length }}</strong>
        </span>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="btn btn-secondary btn-sm"
          @click="resetFilters"
        >
          ✕ Скинути фільтри
        </button>
      </div>
    </div>

    <!-- UX-стан: Помилка сервера або мережі -->
    <div v-if="error" class="card state-box error-box">
      <div class="state-icon">⚠️</div>
      <h3>Помилка завантаження даних</h3>
      <p>{{ error }}</p>
      <button class="btn btn-primary btn-sm" @click="fetchSensors">
        ↻ Спробувати знову
      </button>
    </div>

    <!-- UX-стан: Завантаження даних -->
    <div v-else-if="isLoading" class="card state-box">
      <div class="spinner spinner-dark spinner-lg"></div>
      <p class="loading-text">Отримання даних із сервера телеметрії...</p>
    </div>

    <!-- UX-стан: Порожній результат -->
    <div v-else-if="sensors.length === 0" class="card state-box empty-box">
      <div class="state-icon">🔎</div>
      <h3>Датчиків не знайдено</h3>
      <p v-if="hasActiveFilters">
        За вашими критеріями пошуку не знайдено жодного пристрою. Спробуйте змінити фільтри.
      </p>
      <p v-else>
        У системі поки немає зареєстрованих телеметричних датчиків. Створіть перший датчик!
      </p>
      <div class="empty-actions">
        <button v-if="hasActiveFilters" class="btn btn-secondary" @click="resetFilters">
          Скинути фільтри
        </button>
        <router-link v-else to="/sensors/new" class="btn btn-primary">
          + Створити датчик
        </router-link>
      </div>
    </div>

    <!-- Таблиця реєстру датчиків -->
    <div v-else class="card table-card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Серійний номер</th>
              <th>Назва моделі</th>
              <th>Вузол (Зона)</th>
              <th>Тип величини</th>
              <th>Критичний поріг</th>
              <th>Статус</th>
              <th class="text-right">Дії</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sensor in sensors" :key="sensor.id">
              <td class="cell-serial">
                <span class="code-mono serial-badge">{{ sensor.serialNumber }}</span>
              </td>
              <td class="cell-name">
                <strong>{{ sensor.name }}</strong>
                <span v-if="sensor.description" class="sub-desc" :title="sensor.description">
                  {{ sensor.description.length > 50 ? sensor.description.substring(0, 50) + '...' : sensor.description }}
                </span>
              </td>
              <td>{{ sensor.zone }}</td>
              <td>
                <span class="metric-tag">{{ sensor.metricType }}</span>
              </td>
              <td>
                <strong class="threshold-val">{{ sensor.criticalThreshold }}</strong>
                <span class="threshold-unit">{{ getMetricUnit(sensor.metricType) }}</span>
              </td>
              <td>
                <StatusBadge :status="sensor.status" />
              </td>
              <td class="text-right cell-actions">
                <router-link
                  :to="`/sensors/${sensor.id}`"
                  class="btn btn-secondary btn-sm"
                  title="Переглянути деталі"
                >
                  👁 Деталі
                </router-link>
                <router-link
                  :to="`/sensors/${sensor.id}/edit`"
                  class="btn btn-secondary btn-sm"
                  title="Редагувати параметри"
                >
                  ✎ Змінити
                </router-link>
                <button
                  type="button"
                  class="btn btn-outline-danger btn-sm"
                  title="Видалити датчик"
                  @click="openDeleteModal(sensor)"
                >
                  🗑
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модальне вікно підтвердження видалення -->
    <ConfirmModal
      :isOpen="isDeleteModalOpen"
      title="Підтвердження видалення датчика"
      :message="`Ви дійсно бажаєте видалити датчик ${sensorToDelete?.serialNumber} (${sensorToDelete?.name})? Цю дію неможливо буде скасувати.`"
      confirmText="Видалити датчик"
      cancelText="Скасувати"
      :isDanger="true"
      :isLoading="isDeleting"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sensorApi } from '../services/api';
import { showToast } from '../services/toast';
import StatusBadge from '../components/StatusBadge.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { ZONES, STATUSES, SORT_FIELDS, getMetricUnit } from '../utils/constants';

const route = useRoute();
const router = useRouter();

// Стан датчиків
const sensors = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Стан фільтрів
const filters = reactive({
  search: '',
  zone: '',
  status: '',
  sortBy: 'serialNumber',
  sortOrder: 'asc'
});

// Стан модального вікна видалення
const isDeleteModalOpen = ref(false);
const sensorToDelete = ref(null);
const isDeleting = ref(false);

// Перевірка наявності активних фільтрів
const hasActiveFilters = computed(() => {
  return (
    filters.search !== '' ||
    filters.zone !== '' ||
    filters.status !== '' ||
    filters.sortBy !== 'serialNumber' ||
    filters.sortOrder !== 'asc'
  );
});

// Ініціалізація стану фільтрів з URL-адреси при завантаженні компонента
function initFiltersFromQuery() {
  const query = route.query;
  filters.search = typeof query.search === 'string' ? query.search : '';
  filters.zone = typeof query.zone === 'string' ? query.zone : '';
  filters.status = typeof query.status === 'string' ? query.status : '';
  filters.sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'serialNumber';
  filters.sortOrder = typeof query.sortOrder === 'string' ? query.sortOrder : 'asc';
}

// Синхронізація фільтрів у query-параметри URL
function syncFiltersToQuery() {
  const query = {};
  if (filters.search) query.search = filters.search;
  if (filters.zone) query.zone = filters.zone;
  if (filters.status) query.status = filters.status;
  if (filters.sortBy && filters.sortBy !== 'serialNumber') query.sortBy = filters.sortBy;
  if (filters.sortOrder && filters.sortOrder !== 'asc') query.sortOrder = filters.sortOrder;

  // Використовуємо router.replace, щоб не засмічувати історію переходів браузера кожним символом
  router.replace({ query }).catch(() => {});
}

// Запит до REST API для завантаження датчиків
async function fetchSensors() {
  isLoading.value = true;
  error.value = null;

  try {
    const data = await sensorApi.getSensors({
      search: filters.search,
      zone: filters.zone,
      status: filters.status,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    });
    sensors.value = data;
  } catch (err) {
    console.error('Помилка при завантаженні датчиків:', err);
    error.value = err.message || 'Не вдалося встановити з’єднання із сервером';
  } finally {
    isLoading.value = false;
  }
}

// Дебаунс для живого пошуку
let searchTimeout = null;
function onFilterChange() {
  syncFiltersToQuery();

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    fetchSensors();
  }, 250);
}

// Перемикання напрямку сортування
function toggleSortOrder() {
  filters.sortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
  onFilterChange();
}

// Скидання всіх фільтрів
function resetFilters() {
  filters.search = '';
  filters.zone = '';
  filters.status = '';
  filters.sortBy = 'serialNumber';
  filters.sortOrder = 'asc';
  syncFiltersToQuery();
  fetchSensors();
}

// Управління модальним вікном видалення
function openDeleteModal(sensor) {
  sensorToDelete.value = sensor;
  isDeleteModalOpen.value = true;
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false;
  sensorToDelete.value = null;
}

// Підтвердження видалення
async function confirmDelete() {
  if (!sensorToDelete.value) return;

  isDeleting.value = true;
  try {
    await sensorApi.deleteSensor(sensorToDelete.value.id);
    showToast(`Датчик ${sensorToDelete.value.serialNumber} успішно видалено`, 'success');
    closeDeleteModal();
    // Оновлюємо список після видалення
    await fetchSensors();
  } catch (err) {
    console.error('Помилка видалення:', err);
    showToast(err.message || 'Помилка при видаленні датчика', 'error');
  } finally {
    isDeleting.value = false;
  }
}

// Відстеження змін параметрів в URL (наприклад, при переході назад/вперед у браузері)
watch(
  () => route.query,
  () => {
    initFiltersFromQuery();
    fetchSensors();
  }
);

onMounted(() => {
  initFiltersFromQuery();
  fetchSensors();
});
</script>

<style scoped>
.sensor-list-page {
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

.filter-card {
  padding: 18px 20px;
  margin-bottom: 24px;
}

.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.2fr 1.6fr;
  gap: 16px;
}

@media (max-width: 900px) {
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}

.filter-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-muted);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  font-size: 13px;
  opacity: 0.6;
  pointer-events: none;
}

.input-with-icon input {
  padding-left: 32px;
}

.sort-controls {
  display: flex;
  gap: 8px;
}

.btn-direction {
  white-space: nowrap;
  font-size: 12px;
  padding: 6px 10px;
}

.filter-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color);
}

.results-count {
  font-size: 13px;
  color: var(--text-muted);
}

/* Таблиця */
.table-card {
  box-shadow: var(--shadow-sm);
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.data-table th {
  background-color: var(--bg-surface-alt);
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background-color: #f8fafc;
}

.cell-serial {
  white-space: nowrap;
}

.serial-badge {
  background-color: #f1f5f9;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12.5px;
  border: 1px solid #e2e8f0;
  color: #334155;
}

.cell-name {
  display: flex;
  flex-direction: column;
}

.sub-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.metric-tag {
  background-color: #f0fdf4;
  color: #166534;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12.5px;
  border: 1px solid #bbf7d0;
}

.threshold-val {
  font-family: var(--font-mono);
  font-size: 15px;
}

.threshold-unit {
  font-size: 13px;
  color: var(--text-muted);
  margin-left: 4px;
}

.text-right {
  text-align: right;
}

.cell-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  white-space: nowrap;
}

/* UX Стан блоки */
.state-box {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.state-icon {
  font-size: 36px;
}

.state-box h3 {
  font-size: 18px;
  font-weight: 600;
}

.state-box p {
  color: var(--text-muted);
  font-size: 14px;
  max-width: 440px;
}

.loading-text {
  color: var(--text-muted);
  font-size: 14px;
}

.error-box {
  border-color: var(--color-danger-border);
  background-color: #fffafb;
}

.empty-actions {
  margin-top: 8px;
}
</style>
