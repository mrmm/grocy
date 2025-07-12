import { defineStore } from 'pinia';
import { pb } from '../lib/pb';
import type { RecordModel } from 'pocketbase';

interface StockState {
	entries: RecordModel[];
	totals: Record<string, number>;
	loading: boolean;
}

interface PurchaseInput {
	productId: string;
	amount: number;
}

export const useStockStore = defineStore('stock', {
	state: (): StockState => ({
		entries: [],
		totals: {},
		loading: false,
	}),
	actions: {
		async fetch() {
			if (this.entries.length) return;
			this.loading = true;
			this.entries = await pb.collection('stock_entries').getFullList({ expand: 'product' });
			this.recalculateTotals();
			this.loading = false;

			pb.collection('stock_entries').subscribe('*', (e) => {
				if (e.action === 'delete') {
					this.entries = this.entries.filter((r) => r.id !== e.record.id);
				} else {
					const idx = this.entries.findIndex((r) => r.id === e.record.id);
					if (idx === -1) this.entries.push(e.record);
					else this.entries[idx] = e.record;
				}
				this.recalculateTotals();
			});
		},
		recalculateTotals() {
			const map: Record<string, number> = {};
			for (const entry of this.entries) {
				const pid = entry.product;
				map[pid] = (map[pid] || 0) + entry.amount;
			}
			this.totals = map;
		},
		async purchase(input: PurchaseInput) {
			await fetch(pb.baseUrl + '/stock/purchase', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input),
			});
		},
	},
});