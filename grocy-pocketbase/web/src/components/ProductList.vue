<template>
  <Loader v-if="loading" />
  <p v-else-if="error" class="error">{{ error }}</p>
  <div v-else class="grid">
    <ProductCard
      v-for="p in products"
      :key="p.id"
      :product="p"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProductStore } from '../stores/products';
import ProductCard from './ProductCard.vue';
import Loader from './Loader.vue';

const productStore = useProductStore();
productStore.fetch();
const { products, loading, error } = storeToRefs(productStore);
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}
.error { color: #e53e3e; text-align: center; }
</style>