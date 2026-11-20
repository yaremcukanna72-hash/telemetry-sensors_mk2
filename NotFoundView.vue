<template>
  <div class="not-found-page">
    <div class="card not-found-card">
      <div class="not-found-code">404</div>
      <h1 class="not-found-title">Сторінку не знайдено</h1>
      <p class="not-found-text">
        Запитувана вами адреса <code>{{ currentPath }}</code> не існує в системі обліку датчиків або була переміщена.
      </p>
      <div class="not-found-actions">
        <router-link to="/sensors" class="btn btn-primary btn-lg">
          ← Повернутися до реєстру датчиків
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const currentPath = computed(() => route.fullPath);
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.not-found-card {
  max-width: 520px;
  width: 100%;
  text-align: center;
  padding: 48px 32px;
  box-shadow: var(--shadow);
}

.not-found-code {
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  color: var(--color-primary);
  font-family: var(--font-mono);
  margin-bottom: 12px;
}

.not-found-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-main);
}

.not-found-text {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 28px;
}

.not-found-text code {
  background-color: var(--bg-surface-alt);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-danger-text);
}

.not-found-actions {
  display: flex;
  justify-content: center;
}
</style>
