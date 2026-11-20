<template>
  <span :class="['badge', `badge-${status}`]">
    <span class="badge-dot"></span>
    {{ statusLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (val) => ['active', 'maintenance', 'decommissioned'].includes(val)
  }
});

const statusLabel = computed(() => {
  switch (props.status) {
    case 'active':
      return 'Активний';
    case 'maintenance':
      return 'Обслуговування';
    case 'decommissioned':
      return 'Списаний';
    default:
      return props.status;
  }
});
</script>
