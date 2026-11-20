import { ref } from 'vue';

const toasts = ref([]);

let nextId = 1;

/** Показати спливаюче сповіщення
  @param {string} message - Текст повідомлення
  @param {'success'|'error'|'info'} type - Тип сповіщення
  @param {number} duration - Час показу в мілісекундах
 */
export function showToast(message, type = 'info', duration = 4000) {
  const id = nextId++;
  const toast = { id, message, type };

  toasts.value.push(toast);

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
}

export function removeToast(id) {
  toasts.value = toasts.value.filter(t => t.id !== id);
}

export function useToast() {
  return {
    toasts,
    showToast,
    removeToast
  };
}
