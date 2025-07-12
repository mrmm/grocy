<template>
  <div class="loader" :class="{ inline }"></div>
</template>

<script setup lang="ts">
interface Props { inline?: boolean }
withDefaults(defineProps<Props>(), { inline: false });
</script>

<style scoped>
.loader {
  border: 4px solid #e2e8f0;
  border-top: 4px solid #2d8cf0;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
  margin: auto;
}
.loader.inline {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>