<template>
  <div>
    <h2>Chores</h2>
    <p v-if="loading">Loading...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <ul v-else>
      <li v-for="c in chores" :key="c.id">
        {{ c.name }} – next: {{ c.next_execution || 'n/a' }}
        <button @click="execute(c.id)" :disabled="execLoading">Execute</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useChoresStore } from '../stores/chores';

const choresStore = useChoresStore();
const { chores, loading, error } = storeToRefs(choresStore);

if (!chores.value.length && !loading.value) choresStore.fetch();

const execLoading = false;
function execute(id: string) {
  choresStore.execute(id);
}
</script>

<style scoped>
.error { color: #e53e3e; }
ul { list-style: none; padding: 0; }
li { margin: .25rem 0; }
</style> 