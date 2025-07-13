<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="dialog">
      <h2>Consume</h2>
      <form @submit.prevent="submit">
        <label>
          Product
          <select v-model="productId">
            <option :value="''" disabled>Select</option>
            <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </label>
        <label>
          Amount
          <input type="number" step="0.01" v-model.number="amount" />
        </label>
        <button type="submit">Consume</button>
        <button type="button" @click="$emit('close')">Cancel</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProductStore } from '../stores/products';
import { useStockStore } from '../stores/stock';

const productsStore = useProductStore();
const products = productsStore.products;

const productId = ref('');
const amount = ref(1);

const stockStore = useStockStore();

async function submit() {
  if (!productId.value || amount.value <= 0) return;
  await stockStore.consume({ productId: productId.value, amount: amount.value });
  emit('close');
}

const emit = defineEmits(['close']);
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog {
  background: #fff;
  padding: 1rem;
  border-radius: 6px;
  min-width: 300px;
}
.dialog form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>