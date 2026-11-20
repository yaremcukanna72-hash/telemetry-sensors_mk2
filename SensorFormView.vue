<template>
  <div class="sensor-form-page">
    <div class="form-header">
      <router-link to="/sensors" class="btn btn-secondary btn-sm">
        ← До реєстру датчиків
      </router-link>
      <h1 class="page-title">
        {{ isEditMode ? 'Редагування датчика' : 'Реєстрація нового датчика' }}
      </h1>
      <p class="page-subtitle">
        {{ isEditMode ? `Модифікація параметрів пристрою ${formData.serialNumber}` : 'Заповніть форму для внесення телеметричного датчика до реєстру' }}
      </p>
    </div>

    <!-- Завантаження даних при редагуванні -->
    <div v-if="isLoadingData" class="card state-box">
      <div class="spinner spinner-dark spinner-lg"></div>
      <p class="loading-text">Завантаження даних датчика...</p>
    </div>

    <!-- Головна форма -->
    <div v-else class="card form-card">
      <!-- Глобальне повідомлення про помилку від сервера -->
      <div v-if="serverError" class="server-error-banner">
        <span class="error-icon">⚠️</span>
        <div>
          <strong>Помилка збереження:</strong> {{ serverError }}
        </div>
      </div>

      <form @submit.prevent="handleSubmit" novalidate>
        <div class="form-grid">
          <!-- 1. Серійний номер -->
          <div class="form-group">
            <label class="form-label" for="serialNumber">
              Серійний номер <span class="required">*</span>
            </label>
            <input
              id="serialNumber"
              type="text"
              v-model="formData.serialNumber"
              :class="['form-control code-mono', { 'is-invalid': errors.serialNumber }]"
              placeholder="SNS-1042-AB"
              @blur="touchAndValidate('serialNumber')"
              @input="onFieldInput('serialNumber')"
            />
            <div v-if="errors.serialNumber" class="form-error">
              <span>✕</span> {{ errors.serialNumber }}
            </div>
            <div v-else class="form-hint">
              Формат: <strong>SNS-XXXX-YY</strong> (наприклад, SNS-1042-AB)
            </div>
          </div>

          <!-- 2. Назва моделі -->
          <div class="form-group">
            <label class="form-label" for="name">
              Назва моделі / позначення <span class="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              v-model="formData.name"
              :class="['form-control', { 'is-invalid': errors.name }]"
              placeholder="наприклад, Термодатчик реактора TR-10"
              @blur="touchAndValidate('name')"
              @input="onFieldInput('name')"
            />
            <div v-if="errors.name" class="form-error">
              <span>✕</span> {{ errors.name }}
            </div>
            <div v-else class="form-hint">
              Від 3 до 60 символів (зараз: {{ formData.name.length }})
            </div>
          </div>

          <!-- 3. Зона розміщення -->
          <div class="form-group">
            <label class="form-label" for="zone">
              Вузол інфраструктури (Зона) <span class="required">*</span>
            </label>
            <select
              id="zone"
              v-model="formData.zone"
              :class="['form-select', { 'is-invalid': errors.zone }]"
              @blur="touchAndValidate('zone')"
              @change="onFieldInput('zone')"
            >
              <option value="" disabled>-- Оберіть зону розміщення --</option>
              <option v-for="z in ZONES" :key="z" :value="z">{{ z }}</option>
            </select>
            <div v-if="errors.zone" class="form-error">
              <span>✕</span> {{ errors.zone }}
            </div>
          </div>

          <!-- 4. Тип вимірюваної величини -->
          <div class="form-group">
            <label class="form-label" for="metricType">
              Тип вимірюваної величини <span class="required">*</span>
            </label>
            <select
              id="metricType"
              v-model="formData.metricType"
              :class="['form-select', { 'is-invalid': errors.metricType }]"
              @blur="touchAndValidate('metricType')"
              @change="onFieldInput('metricType')"
            >
              <option value="" disabled>-- Оберіть тип величини --</option>
              <option v-for="mt in METRIC_TYPES" :key="mt" :value="mt">{{ mt }}</option>
            </select>
            <div v-if="errors.metricType" class="form-error">
              <span>✕</span> {{ errors.metricType }}
            </div>
          </div>

          <!-- 5. Критичний поріг спрацьовування -->
          <div class="form-group">
            <label class="form-label" for="criticalThreshold">
              Критичний поріг ({{ currentUnit || 'од.' }}) <span class="required">*</span>
            </label>
            <div class="input-with-suffix">
              <input
                id="criticalThreshold"
                type="number"
                step="0.1"
                min="0.1"
                max="999.9"
                v-model="formData.criticalThreshold"
                :class="['form-control code-mono', { 'is-invalid': errors.criticalThreshold }]"
                placeholder="наприклад, 85.5"
                @blur="touchAndValidate('criticalThreshold')"
                @input="onFieldInput('criticalThreshold')"
              />
              <span v-if="currentUnit" class="input-suffix">{{ currentUnit }}</span>
            </div>
            <div v-if="errors.criticalThreshold" class="form-error">
              <span>✕</span> {{ errors.criticalThreshold }}
            </div>
            <div v-else class="form-hint">
              Число від 0.1 до 999.9
            </div>
          </div>

          <!-- 6. Робочий статус -->
          <div class="form-group">
            <label class="form-label" for="status">
              Статус датчика <span class="required">*</span>
            </label>
            <select
              id="status"
              v-model="formData.status"
              :class="['form-select', { 'is-invalid': errors.status }]"
              @blur="touchAndValidate('status')"
              @change="onFieldInput('status')"
            >
              <option v-for="st in STATUSES" :key="st.value" :value="st.value">{{ st.label }}</option>
            </select>
            <div v-if="errors.status" class="form-error">
              <span>✕</span> {{ errors.status }}
            </div>
          </div>

          <!-- 7. Дата встановлення -->
          <div class="form-group">
            <label class="form-label" for="installedAt">
              Дата встановлення <span class="required">*</span>
            </label>
            <input
              id="installedAt"
              type="date"
              :max="maxDateToday"
              v-model="formData.installedAt"
              :class="['form-control', { 'is-invalid': errors.installedAt }]"
              @blur="touchAndValidate('installedAt')"
              @input="onFieldInput('installedAt')"
            />
            <div v-if="errors.installedAt" class="form-error">
              <span>✕</span> {{ errors.installedAt }}
            </div>
            <div v-else class="form-hint">
              Не може бути в майбутньому
            </div>
          </div>
        </div>

        <!-- 8. Опис та примітки інженера -->
        <div class="form-group full-width">
          <label class="form-label" for="description">
            Примітки інженера (необов'язково)
          </label>
          <textarea
            id="description"
            rows="3"
            maxlength="300"
            v-model="formData.description"
            :class="['form-textarea', { 'is-invalid': errors.description }]"
            placeholder="Введіть технологічні примітки, історію монтажу чи особливості експлуатації..."
            @blur="touchAndValidate('description')"
            @input="onFieldInput('description')"
          ></textarea>
          <div v-if="errors.description" class="form-error">
            <span>✕</span> {{ errors.description }}
          </div>
          <div class="form-hint text-right-hint">
            Символів: {{ (formData.description || '').length }} / 300
          </div>
        </div>

        <!-- Кнопки дій -->
        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="isSubmitting"
            @click="cancelForm"
          >
            Скасувати
          </button>
          <button
            type="submit"
            class="btn btn-primary btn-submit"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="spinner"></span>
            <span>{{ isSubmitting ? 'Збереження...' : (isEditMode ? 'Оновити датчик' : 'Зареєструвати датчик') }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Модальне вікно захисту від втрати даних -->
    <ConfirmModal
      :isOpen="isLeaveModalOpen"
      title="Незбережені зміни"
      message="У вас є незбережені зміни. Ви дійсно бажаєте залишити сторінку? Усі внесені дані буде втрачено."
      confirmText="Так, залишити сторінку"
      cancelText="Продовжити редагування"
      :isDanger="false"
      @confirm="confirmLeave"
      @cancel="cancelLeave"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { sensorApi } from '../services/api';
import { showToast } from '../services/toast';
import ConfirmModal from '../components/ConfirmModal.vue';
import { ZONES, METRIC_TYPES, STATUSES, getMetricUnit } from '../utils/constants';

const route = useRoute();
const router = useRouter();

// Режим роботи: створення чи редагування
const isEditMode = computed(() => !!route.params.id);

// Стан завантаження даних при редагуванні
const isLoadingData = ref(false);
const isSubmitting = ref(false);
const serverError = ref(null);

// Дата сьогодні для атрибута max
const maxDateToday = new Date().toISOString().split('T')[0];

// Початкові дані форми
const initialFormState = {
  serialNumber: '',
  name: '',
  zone: '',
  metricType: '',
  criticalThreshold: '',
  status: 'active',
  installedAt: maxDateToday,
  description: ''
};

// Реактивний стан полів форми
const formData = reactive({ ...initialFormState });

// Збережена копія для перевірки "isDirty"
const originalData = ref(JSON.stringify(formData));

// Помилки валідації полів
const errors = reactive({});
const touched = reactive({});

// Одиниця вимірювання залежно від обраного metricType
const currentUnit = computed(() => getMetricUnit(formData.metricType));

// Перевірка, чи користувач змінював дані форми (isDirty)
const isDirty = computed(() => {
  return JSON.stringify(formData) !== originalData.value;
});

// Клієнтська валідація окремого поля
function validateField(field) {
  delete errors[field];

  switch (field) {
    case 'serialNumber': {
      const serial = (formData.serialNumber || '').trim();
      if (!serial) {
        errors.serialNumber = 'Серійний номер є обов’язковим полем';
      } else if (!/^SNS-[A-Za-z0-9]{4}-[A-Za-z0-9]{2}$/.test(serial.toUpperCase())) {
        errors.serialNumber = 'Формат має бути SNS-XXXX-YY (наприклад, SNS-1042-AB)';
      }
      break;
    }

    case 'name': {
      const name = (formData.name || '').trim();
      if (!name) {
        errors.name = 'Назва моделі є обов’язковою';
      } else if (name.length < 3 || name.length > 60) {
        errors.name = 'Назва моделі повинна містити від 3 до 60 символів';
      }
      break;
    }

    case 'zone': {
      if (!formData.zone) {
        errors.zone = 'Необхідно обрати зону розміщення';
      }
      break;
    }

    case 'metricType': {
      if (!formData.metricType) {
        errors.metricType = 'Необхідно обрати тип величини';
      }
      break;
    }

    case 'criticalThreshold': {
      const val = parseFloat(formData.criticalThreshold);
      if (formData.criticalThreshold === '' || isNaN(val)) {
        errors.criticalThreshold = 'Вкажіть числове значення порогу';
      } else if (val < 0.1 || val > 999.9) {
        errors.criticalThreshold = 'Значення повинно бути в діапазоні 0.1 – 999.9';
      }
      break;
    }

    case 'status': {
      if (!formData.status) {
        errors.status = 'Оберіть статус датчика';
      }
      break;
    }

    case 'installedAt': {
      const dateVal = (formData.installedAt || '').trim();
      if (!dateVal) {
        errors.installedAt = 'Дата встановлення є обов’язковою';
      } else {
        const d = new Date(dateVal);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (isNaN(d.getTime())) {
          errors.installedAt = 'Введіть коректну дату';
        } else if (d > today) {
          errors.installedAt = 'Дата встановлення не може бути в майбутньому';
        }
      }
      break;
    }

    case 'description': {
      if (formData.description && formData.description.length > 300) {
        errors.description = 'Опис не повинен перевищувати 300 символів';
      }
      break;
    }
  }
}

// Позначити поле як "торкнуте" та перевірити
function touchAndValidate(field) {
  touched[field] = true;
  validateField(field);
}

// При введенні валідуємо тільки якщо поле вже було перевірено або є помилка
function onFieldInput(field) {
  if (touched[field] || errors[field]) {
    validateField(field);
  }
}

// Валідація всієї форми перед відправкою
function validateAll() {
  const fields = ['serialNumber', 'name', 'zone', 'metricType', 'criticalThreshold', 'status', 'installedAt', 'description'];
  fields.forEach(f => {
    touched[f] = true;
    validateField(f);
  });
  return Object.keys(errors).length === 0;
}

// Завантаження даних датчика при режимі редагування
async function loadSensorForEdit() {
  if (!isEditMode.value) return;

  isLoadingData.value = true;
  try {
    const sensor = await sensorApi.getSensorById(route.params.id);
    formData.serialNumber = sensor.serialNumber;
    formData.name = sensor.name;
    formData.zone = sensor.zone;
    formData.metricType = sensor.metricType;
    formData.criticalThreshold = sensor.criticalThreshold;
    formData.status = sensor.status;
    formData.installedAt = sensor.installedAt;
    formData.description = sensor.description || '';

    // Зберігаємо оригінал для відстеження isDirty
    originalData.value = JSON.stringify(formData);
  } catch (err) {
    console.error('Помилка завантаження даних датчика для редагування:', err);
    showToast('Не вдалося завантажити дані датчика', 'error');
    router.push('/sensors');
  } finally {
    isLoadingData.value = false;
  }
}

// Відправлення форми
async function handleSubmit() {
  serverError.value = null;

  if (!validateAll()) {
    showToast('Будь ласка, виправте виділені помилки у формі', 'error');
    return;
  }

  isSubmitting.value = true;

  const payload = {
    serialNumber: formData.serialNumber.trim().toUpperCase(),
    name: formData.name.trim(),
    zone: formData.zone,
    metricType: formData.metricType,
    criticalThreshold: parseFloat(formData.criticalThreshold),
    status: formData.status,
    installedAt: formData.installedAt,
    description: formData.description ? formData.description.trim() : ''
  };

  try {
    if (isEditMode.value) {
      await sensorApi.updateSensor(route.params.id, payload);
      showToast('Дані датчика успішно оновлено!', 'success');
    } else {
      await sensorApi.createSensor(payload);
      showToast('Датчик успішно додано до реєстру!', 'success');
    }

    // Скидаємо прапорець брудних даних, щоб перехід відбувся без попередження
    originalData.value = JSON.stringify(formData);

    // Перехід до реєстру
    router.push('/sensors');
  } catch (err) {
    console.error('Помилка при збереженні форми:', err);
    serverError.value = err.message || 'Не вдалося зберегти зміни на сервері';

    // Відображення специфічних помилок валідації від сервера
    if (err.errors) {
      Object.keys(err.errors).forEach(key => {
        errors[key] = err.errors[key];
      });
    }

    showToast(serverError.value, 'error');
  } finally {
    isSubmitting.value = false;
  }
}

// Кнопка Скасувати
function cancelForm() {
  if (isDirty.value) {
    nextRouteTarget.value = '/sensors';
    isLeaveModalOpen.value = true;
  } else {
    router.push('/sensors');
  }
}

// =========================================================================
// Захист від випадкової втрати даних (Unsaved Changes Guard)
// =========================================================================
const isLeaveModalOpen = ref(false);
const nextRouteTarget = ref(null);
let allowNavigation = false;

// Перехоплення навігації у Vue Router
onBeforeRouteLeave((to, from, next) => {
  if (allowNavigation || !isDirty.value) {
    next();
  } else {
    nextRouteTarget.value = to;
    isLeaveModalOpen.value = true;
    next(false); // зупиняємо навігацію
  }
});

function confirmLeave() {
  allowNavigation = true;
  isLeaveModalOpen.value = false;
  if (nextRouteTarget.value) {
    router.push(nextRouteTarget.value);
  } else {
    router.push('/sensors');
  }
}

function cancelLeave() {
  isLeaveModalOpen.value = false;
  nextRouteTarget.value = null;
}

// Захист від закриття вкладки або оновлення сторінки F5
function handleBeforeUnload(e) {
  if (isDirty.value) {
    e.preventDefault();
    e.returnValue = 'У вас є незбережені зміни. Ви дійсно бажаєте залишити сторінку?';
    return e.returnValue;
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  if (isEditMode.value) {
    loadSensorForEdit();
  } else {
    originalData.value = JSON.stringify(formData);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style scoped>
.sensor-form-page {
  max-width: 780px;
  margin: 0 auto;
  padding-bottom: 50px;
}

.form-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-top: 12px;
  color: var(--text-main);
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

.form-card {
  padding: 24px;
  box-shadow: var(--shadow);
}

.server-error-banner {
  background-color: var(--color-danger-bg);
  border: 1px solid var(--color-danger-border);
  color: var(--color-danger-text);
  padding: 12px 16px;
  border-radius: var(--border-radius-sm);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.full-width {
  grid-column: 1 / -1;
  margin-top: 6px;
}

.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-suffix {
  position: absolute;
  right: 12px;
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
  pointer-events: none;
}

.text-right-hint {
  text-align: right;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.btn-submit {
  min-width: 170px;
}

.state-box {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
</style>
