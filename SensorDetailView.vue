<template>
  <div class="sensor-detail-page">
    <!-- Кнопка повернення назад -->
    <div class="navigation-bar">
      <button type="button" class="btn btn-secondary btn-sm" @click="goBack">
        ← Повернутися до реєстру
      </button>
    </div>

    <!-- Завантаження -->
    <div v-if="isLoading" class="card state-box">
      <div class="spinner spinner-dark spinner-lg"></div>
      <p class="loading-text">Завантаження інформації про датчик...</p>
    </div>

    <!-- Помилка 404 або мережі -->
    <div v-else-if="error || !sensor" class="card state-box error-box">
      <div class="state-icon">🔍</div>
      <h3>Датчик не знайдено</h3>
      <p>{{ error || 'Запитуваний пристрій відсутній або був видалений із системи.' }}</p>
      <router-link to="/sensors" class="btn btn-primary btn-sm">
        До списку датчиків
      </router-link>
    </div>

    <!-- Детальна картка пристрою -->
    <div v-else class="card detail-card">
      <div class="card-header detail-header">
        <div class="header-main">
          <span class="code-mono serial-title">{{ sensor.serialNumber }}</span>
          <h1 class="device-name">{{ sensor.name }}</h1>
        </div>
        <div class="header-status">
          <StatusBadge :status="sensor.status" />
        </div>
      </div>

      <div class="card-body">
        <div class="specs-grid">
          <!-- Ідентифікатор у системі -->
          <div class="spec-item">
            <span class="spec-label">Системний ID:</span>
            <span class="spec-value code-mono">{{ sensor.id }}</span>
          </div>

          <!-- Виробнича зона -->
          <div class="spec-item">
            <span class="spec-label">Вузол розміщення (Зона):</span>
            <span class="spec-value">
              <span class="zone-badge">📍 {{ sensor.zone }}</span>
            </span>
          </div>

          <!-- Тип вимірюваної величини -->
          <div class="spec-item">
            <span class="spec-label">Тип вимірювання:</span>
            <span class="spec-value">{{ sensor.metricType }}</span>
          </div>

          <!-- Граничний поріг спрацьовування -->
          <div class="spec-item">
            <span class="spec-label">Критичний поріг спрацьовування:</span>
            <span class="spec-value">
              <strong class="threshold-highlight">{{ sensor.criticalThreshold }}</strong>
              <span class="unit-text">{{ getMetricUnit(sensor.metricType) }}</span>
            </span>
          </div>

          <!-- Дата монтажу / введення в експлуатацію -->
          <div class="spec-item">
            <span class="spec-label">Дата встановлення:</span>
            <span class="spec-value">📅 {{ formatDate(sensor.installedAt) }} ({{ sensor.installedAt }})</span>
          </div>

          <!-- Поточний робочий стан -->
          <div class="spec-item">
            <span class="spec-label">Робочий статус:</span>
            <span class="spec-value">
              <StatusBadge :status="sensor.status" />
            </span>
          </div>
        </div>

        <!-- Опис та технічні примітки інженера -->
        <div class="description-section">
          <h3 class="section-title">Примітки інженера та опис:</h3>
          <div class="description-box">
            <p v-if="sensor.description && sensor.description.trim()">
              {{ sensor.description }}
            </p>
            <p v-else class="text-muted italic">
              Технічні примітки для цього пристрою відсутні.
            </p>
          </div>
        </div>
      </div>

      <!-- Нижня панель дій -->
      <div class="card-footer detail-footer">
        <button type="button" class="btn btn-outline-danger" @click="isDeleteModalOpen = true">
          🗑 Видалити
        </button>
        <div class="right-actions">
          <router-link :to="`/sensors/${sensor.id}/edit`" class="btn btn-primary">
            ✎ Редагувати параметри
          </router-link>
        </div>
      </div>
    </div>

    <!-- Модальне вікно видалення -->
    <ConfirmModal
      :isOpen="isDeleteModalOpen"
      title="Підтвердження видалення"
      :message="`Ви впевнені, що бажаєте видалити датчик ${sensor?.serialNumber} (${sensor?.name})?`"
      confirmText="Видалити"
      cancelText="Скасувати"
      :isDanger="true"
      :isLoading="isDeleting"
      @confirm="handleDelete"
      @cancel="isDeleteModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sensorApi } from '../services/api';
import { showToast } from '../services/toast';
import StatusBadge from '../components/StatusBadge.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { getMetricUnit, formatDate } from '../utils/constants';

const route = useRoute();
const router = useRouter();

const sensor = ref(null);
const isLoading = ref(true);
const error = ref(null);

const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);

async function loadSensor() {
  isLoading.value = true;
  error.value = null;

  try {
    const data = await sensorApi.getSensorById(route.params.id);
    sensor.value = data;
  } catch (err) {
    console.error('Помилка при завантаженні інформації про датчик:', err);
    error.value = err.status === 404 
      ? 'Датчик з вказаним ідентифікатором не існує на сервері.'
      : (err.message || 'Помилка мережі при отриманні даних');
  } finally {
    isLoading.value = false;
  }
}

function goBack() {
  // Повертаємося до попередньої сторінки або до реєстру
  if (window.history.length > 2) {
    router.back();
  } else {
    router.push('/sensors');
  }
}

async function handleDelete() {
  if (!sensor.value) return;

  isDeleting.value = true;
  try {
    await sensorApi.deleteSensor(sensor.value.id);
    showToast(`Датчик ${sensor.value.serialNumber} успішно видалено`, 'success');
    isDeleteModalOpen.value = false;
    router.push('/sensors');
  } catch (err) {
    console.error('Помилка видалення:', err);
    showToast(err.message || 'Не вдалося видалити датчик', 'error');
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  loadSensor();
});
</script>

<style scoped>
.sensor-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.navigation-bar {
  margin-bottom: 20px;
}

.detail-card {
  box-shadow: var(--shadow);
}

.detail-header {
  padding: 22px 24px;
}

.serial-title {
  display: inline-block;
  background-color: #e2e8f0;
  color: #334155;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.device-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
}

.specs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

@media (max-width: 600px) {
  .specs-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-label {
  font-size: 13px;
  color: var(--text-muted);
}

.spec-value {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-main);
}

.zone-badge {
  background-color: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
  font-size: 13.5px;
}

.threshold-highlight {
  font-family: var(--font-mono);
  font-size: 18px;
  color: var(--color-primary);
}

.unit-text {
  font-size: 14px;
  color: var(--text-muted);
  margin-left: 4px;
}

.description-section {
  padding-top: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-main);
}

.description-box {
  background-color: #fafbfc;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

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

.error-box {
  border-color: var(--color-danger-border);
  background-color: #fffafb;
}

.italic {
  font-style: italic;
}
</style>
