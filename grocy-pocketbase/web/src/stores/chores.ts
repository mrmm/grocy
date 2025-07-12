import { defineStore } from 'pinia';
import { ref } from 'vue';
import { pb } from '../lib/pb';
import type { RecordModel } from 'pocketbase';

export interface Chore extends RecordModel {
	name: string;
	period_type: string;
	period_config: number;
	next_execution?: string;
}

export const useChoresStore = defineStore('chores', () => {
	const chores = ref<Chore[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	async function fetch() {
		if (chores.value.length) return;
		loading.value = true;
		try {
			chores.value = await pb.collection('chores').getFullList<Chore>({ sort: "name" });
			pb.collection('chores').unsubscribe("*");
			pb.collection('chores').subscribe<Chore>('*', (e) => {
				const idx = chores.value.findIndex(c => c.id === e.record.id);
				if (e.action === 'delete') {
					if (idx !== -1) chores.value.splice(idx, 1);
				} else {
					if (idx === -1) chores.value.push(e.record);
					else chores.value[idx] = e.record;
				}
			});
			error.value = null;
		} catch (err) {
			error.value = (err as Error).message;
		} finally {
			loading.value = false;
		}
	}

	async function execute(id: string) {
		try {
			await fetch(`/chores/${id}/execute`, { method: 'POST' });
		} catch (err) {
			console.error(err);
		}
	}

	return { chores, loading, error, fetch, execute };
});