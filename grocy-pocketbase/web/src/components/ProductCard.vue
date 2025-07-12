<template>
  <div class="card">
    <div class="thumb" v-if="thumbUrl">
      <img :src="thumbUrl" :alt="product.name" />
    </div>
    <h3>{{ product.name }}</h3>
    <StockBadge :product-id="product.id" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RecordModel } from 'pocketbase';
import StockBadge from './StockBadge.vue';

interface Props {
  product: RecordModel;
}
const props = defineProps<Props>();

const thumbUrl = computed(() => {
  const file = props.product?.picture?.[0];
  if (!file) return '';
  return `/api/files/${props.product.collectionId}/${props.product.id}/${file}?thumb=100x100`;
});
</script>

<style scoped>
.card {
  border: 1px solid #e2e8f0;
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
}
.thumb img {
  max-width: 100%;
  border-radius: 4px;
}
</style>