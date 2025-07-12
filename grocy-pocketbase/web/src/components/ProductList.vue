<template>
  <div class="grid" v-if="!loading">
    <ProductCard
      v-for="p in products"
      :key="p.id"
      :product="p"
    />
  </div>
  <p v-else>Loading…</p>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProductStore } from '../stores/products';
import ProductCard from './ProductCard.vue';

const productStore = useProductStore();
productStore.fetch();
const { products, loading } = storeToRefs(productStore);
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}
</style>