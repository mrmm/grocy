import { defineStore } from 'pinia';
import { pb } from '../lib/pb';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
	const user = ref(pb.authStore.model);
	const loading = ref(false);
	const error = ref<string | null>(null);

	async function login(email: string, password: string) {
		loading.value = true;
		try {
			await pb.collection('users').authWithPassword(email, password);
			user.value = pb.authStore.model;
			error.value = null;
		} catch (err) {
			error.value = (err as Error).message;
		} finally {
			loading.value = false;
		}
	}

	function logout() {
		pb.authStore.clear();
		user.value = null;
	}

	return { user, loading, error, login, logout };
});