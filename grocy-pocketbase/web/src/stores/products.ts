import { defineStore } from 'pinia';
import { pb } from '../lib/pb';
import type { RecordModel } from 'pocketbase';
import { ref } from 'vue';

export const useProductStore = defineStore('products', () => {
	const products = ref<RecordModel[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	async function fetch() {
		if (products.value.length) return;
		loading.value = true;
		try {
			products.value = await pb
				.collection('products')
				.getFullList({ sort: 'name', expand: 'location,qu_stock' });
			error.value = null;
		} catch (err) {
			error.value = (err as Error).message;
		} finally {
			loading.value = false;
		}

		pb.collection('products').unsubscribe('*');
		pb.collection('products').subscribe('*', (e) => {
			const rec = e.record as RecordModel;
			const idx = products.value.findIndex((p) => p.id === rec.id);
			if (e.action === 'delete') {
				if (idx !== -1) products.value.splice(idx, 1);
			} else {
				if (idx === -1) products.value.push(rec);
				else products.value[idx] = rec;
			}
		});
	}

	return { products, loading, error, fetch };
});