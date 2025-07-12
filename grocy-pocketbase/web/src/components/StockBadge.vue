<template>
  <span class="badge" :class="variant">{{ amount }}</span>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useStockStore } from '../stores/stock';

interface Props {
  productId: string;
}
const props = defineProps<Props>();

const stockStore = useStockStore();
const { totals } = storeToRefs(stockStore);

onMounted(() => {
  // ensure store fetched
  stockStore.fetch();
});

const amount = computed(() => totals.value[props.productId] ?? 0);
const variant = computed(() => (amount.value === 0 ? 'danger' : 'normal'));
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: #edf2f7;
  color: #1a202c;
  font-size: 0.8rem;
}
.badge.danger {
  background: #feb2b2;
  color: #742a2a;
}
</style>