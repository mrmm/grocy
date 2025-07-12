import { defineStore } from 'pinia';
import { pb } from '../lib/pb';
import type { RecordModel } from 'pocketbase';
import { ref, reactive } from 'vue';

interface PurchaseInput {
	productId: string;
	amount: number;
}

interface ConsumeInput {
	productId: string;
	amount: number;
}

export const useStockStore = defineStore('stock', () => {
	const entries = ref<RecordModel[]>([]);
	const loading = ref(false);
	const totals = reactive<Record<string, number>>({});

	function recalculateTotals() {
		const map: Record<string, number> = {};
		for (const entry of entries.value) {
			const pid = entry.product as string;
			map[pid] = (map[pid] || 0) + (entry.amount as number);
		}
		Object.assign(totals, map);
	}

	async function fetch() {
		if (entries.value.length) return;
		loading.value = true;
		entries.value = await pb.collection('stock_entries').getFullList({ expand: 'product' });
		recalculateTotals();
		loading.value = false;

		pb.collection('stock_entries').subscribe('*', (e) => {
			const rec = e.record as RecordModel;
			if (e.action === 'delete') {
				entries.value = entries.value.filter((r) => r.id !== rec.id);
			} else {
				const idx = entries.value.findIndex((r) => r.id === rec.id);
				if (idx === -1) entries.value.push(rec);
				else entries.value[idx] = rec;
			}
			recalculateTotals();
		});
	}

	async function purchase(input: PurchaseInput) {
		await fetchApi('/stock/purchase', input);
	}

	async function consume(input: ConsumeInput) {
		await fetchApi('/stock/consume', input);
	}

	async function fetchApi(path: string, body: unknown) {
		await fetch(pb.baseUrl + path, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
	}

	return { entries, loading, totals, fetch, purchase, consume };
});