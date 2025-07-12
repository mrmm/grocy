<template>
  <main class="p-4">
    <h1>Stock</h1>
    <ProductList />

    <button class="fab plus" @click="purchaseOpen = true">＋</button>
    <button class="fab minus" @click="consumeOpen = true">−</button>

    <PurchaseDialog v-if="purchaseOpen" @close="purchaseOpen = false" />
    <ConsumeDialog v-if="consumeOpen" @close="consumeOpen = false" />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProductList from '../components/ProductList.vue';
import PurchaseDialog from '../components/PurchaseDialog.vue';
import ConsumeDialog from '../components/ConsumeDialog.vue';

const purchaseOpen = ref(false);
const consumeOpen = ref(false);
</script>

<style scoped>
.fab {
  position: fixed;
  bottom: 2rem;
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
.fab.plus {
  right: 2rem;
}
.fab.minus {
  right: 6rem;
  background: #e53e3e;
}
</style>