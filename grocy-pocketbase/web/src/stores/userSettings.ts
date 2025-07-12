import { defineStore } from 'pinia';
import { ref } from 'vue';
import { pb } from '../lib/pb';

interface Settings {
	[key: string]: unknown;
}

export const useUserSettingsStore = defineStore('userSettings', () => {
	const settings = ref<Settings>({});
	const loading = ref(false);
	const error = ref<string | null>(null);

	async function fetch() {
		if (loading.value) return;
		loading.value = true;
		try {
			const res: Response = await window.fetch('/user/settings', {
				headers: { 'Content-Type': 'application/json', 'Authorization': pb.authStore.token },
				credentials: 'include'
			});
			const json = (await res.json()) as { settings?: Settings };
			settings.value = json.settings ?? {};
			error.value = null;
		} catch (err) {
			error.value = (err as Error).message;
		} finally {
			loading.value = false;
		}
	}

	async function save(newSettings: Settings) {
		loading.value = true;
		try {
			await window.fetch('/user/settings', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', 'Authorization': pb.authStore.token },
				body: JSON.stringify({ settings: newSettings }),
				credentials: 'include'
			});
			settings.value = newSettings;
			error.value = null;
		} catch (err) {
			error.value = (err as Error).message;
		} finally {
			loading.value = false;
		}
	}

	return { settings, loading, error, fetch, save };
});