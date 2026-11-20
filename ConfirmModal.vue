<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="onCancel">
    <div class="modal-box">
      <div class="modal-header">
        <span>{{ title }}</span>
        <button type="button" class="close-btn" @click="onCancel" aria-label="Закрити">
          ✕
        </button>
      </div>

      <div class="modal-body">
        <p>{{ message }}</p>
      </div>

      <div class="modal-footer">
        <button 
          type="button" 
          class="btn btn-secondary btn-sm" 
          :disabled="isLoading" 
          @click="onCancel"
        >
          {{ cancelText }}
        </button>
        <button 
          type="button" 
          :class="['btn btn-sm', isDanger ? 'btn-danger' : 'btn-primary']" 
          :disabled="isLoading" 
          @click="onConfirm"
        >
          <span v-if="isLoading" class="spinner"></span>
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Підтвердження дії'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Підтвердити'
  },
  cancelText: {
    type: String,
    default: 'Скасувати'
  },
  isDanger: {
    type: Boolean,
    default: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel']);

function onConfirm() {
  emit('confirm');
}

function onCancel() {
  if (!props.isLoading) {
    emit('cancel');
  }
}
</script>

<style scoped>
.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--text-muted);
  line-height: 1;
  padding: 4px 6px;
  border-radius: 4px;
}

.close-btn:hover {
  background-color: var(--bg-surface-alt);
  color: var(--text-main);
}
</style>
