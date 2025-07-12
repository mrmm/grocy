<template>
  <main class="p-4">
    <h1>Stock</h1>
    <ProductList />

    <button class="fab" @click="dialogOpen = true">＋</button>

    <PurchaseDialog v-if="dialogOpen" @close="dialogOpen = false" />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProductList from '../components/ProductList.vue';
import PurchaseDialog from '../components/PurchaseDialog.vue';

const dialogOpen = ref(false);
</script>

<style scoped>
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #2d8cf0;
  color: #fff;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}
</style>