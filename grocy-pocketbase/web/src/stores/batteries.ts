import { defineStore } from 'pinia';
import { ref } from 'vue';
import { pb } from '../lib/pb';
import type { RecordModel } from 'pocketbase';

export interface Battery extends RecordModel {
	name: string;
	next_charge?: string;
}

export const useBatteriesStore = defineStore('batteries', () => {
	const batteries = ref<Battery[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	async function fetch() {
		if (batteries.value.length) return;
		loading.value = true;
		try {
			batteries.value = await pb.collection('batteries').getFullList<Battery>({ sort: 'name' });
			pb.collection('batteries').unsubscribe('*');
			pb.collection('batteries').subscribe<Battery>('*', (e) => {
				const idx = batteries.value.findIndex((b) => b.id === e.record.id);
				if (e.action === 'delete') {
					if (idx !== -1) batteries.value.splice(idx, 1);
				} else {
					if (idx === -1) batteries.value.push(e.record);
					else batteries.value[idx] = e.record;
				}
			});
			error.value = null;
		} catch (err) {
			error.value = (err as Error).message;
		} finally {
			loading.value = false;
		}
	}

	return { batteries, loading, error, fetch };
}); 