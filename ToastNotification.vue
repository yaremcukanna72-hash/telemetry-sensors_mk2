<template>
  <div class="toast-container" aria-live="polite">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast', `toast-${toast.type}`]"
    >
      <div class="toast-icon">
        <span v-if="toast.type === 'success'">✓</span>
        <span v-else-if="toast.type === 'error'">✕</span>
        <span v-else>ℹ</span>
      </div>
      <div class="toast-content">
        {{ toast.message }}
      </div>
      <button 
        type="button" 
        class="toast-close" 
        @click="removeToast(toast.id)"
        aria-label="Закрити сповіщення"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../services/toast';

const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-icon {
  font-weight: bold;
  font-size: 16px;
  line-height: 1;
}

.toast-success .toast-icon {
  color: var(--color-success);
}

.toast-error .toast-icon {
  color: var(--color-danger);
}

.toast-info .toast-icon {
  color: var(--color-primary);
}

.toast-content {
  flex: 1;
  font-size: 13.5px;
  color: var(--text-main);
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  font-size: 14px;
  padding: 0 4px;
}

.toast-close:hover {
  color: var(--text-main);
}
</style>
