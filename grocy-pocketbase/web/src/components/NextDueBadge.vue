<template>
  <span :class="cls">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props { date?: string | null }
const props = defineProps<Props>();

const daysLeft = computed(() => {
  if (!props.date) return null;
  const d = new Date(props.date);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  return diff;
});

const cls = computed(() => {
  if (daysLeft.value == null) return 'badge';
  if (daysLeft.value < 0) return 'badge danger';
  if (daysLeft.value < 3) return 'badge warn';
  return 'badge';
});

const label = computed(() => {
  if (daysLeft.value == null) return '—';
  if (daysLeft.value < 0) return `${-daysLeft.value}d overdue`;
  if (daysLeft.value === 0) return 'today';
  return `${daysLeft.value}d`;
});
</script>

<style scoped>
.badge { padding: 2px 6px; border-radius: 4px; background:#edf2f7; font-size:.75rem; }
.badge.warn { background:#facc15; color:#1a202c; }
.badge.danger { background:#f87171; color:#fff; }
</style>