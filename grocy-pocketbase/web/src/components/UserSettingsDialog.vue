<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="dialog">
      <h2>User settings</h2>
      <form @submit.prevent="save">
        <label>
          Language
          <select v-model="form.language">
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <!-- extend list as needed -->
          </select>
        </label>
        <label>
          <input type="checkbox" v-model="form.darkMode" />
          Dark mode
        </label>
        <div class="actions">
          <button type="submit" :disabled="loading">Save</button>
          <button type="button" @click="$emit('close')">Cancel</button>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserSettingsStore } from '../stores/userSettings';

const emit = defineEmits(['close']);

const settingsStore = useUserSettingsStore();
const { settings, loading, error } = storeToRefs(settingsStore);

// local copy for editing
const form = reactive({
  language: 'en',
  darkMode: false,
});

if (!settings.value.language && !loading.value) {
  // fetch initial on open
  settingsStore.fetch();
}

watch(
  settings,
  (val) => {
    form.language = (val.language as string) || 'en';
    form.darkMode = !!val.darkMode;
  },
  { immediate: true }
);

async function save() {
  await settingsStore.save({ language: form.language, darkMode: form.darkMode });
  if (!error.value) emit('close');
}
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
.actions {
  display: flex;
  gap: 0.5rem;
}
.error {
  color: #e53e3e;
}
</style> 