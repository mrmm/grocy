import { defineStore } from 'pinia';
import { pb } from '../lib/pb';
import type { RecordModel } from 'pocketbase';

interface ProductsState {
	products: RecordModel[];
	loading: boolean;
	error: string | null;
}

export const useProductStore = defineStore<'products', ProductsState>({
	id: 'products',
	state: (): ProductsState => ({
		products: [],
		loading: false,
		error: null,
	}),
	actions: {
		async fetch() {
			if (this.products.length) return; // cached
			this.loading = true;
			try {
				this.products = await pb.collection('products').getFullList({
					sort: 'name',
					expand: 'location,qu_stock',
				});
				this.error = null;
			} catch (err) {
				this.error = (err as Error).message;
			} finally {
				this.loading = false;
			}

			// realtime updates
			pb.collection('products').subscribe('*', (e) => {
				const rec = e.record as RecordModel;
				const idx = this.products.findIndex((p) => p.id === rec.id);
				if (e.action === 'delete') {
					if (idx !== -1) this.products.splice(idx, 1);
				} else {
					if (idx === -1) this.products.push(rec);
					else this.products[idx] = rec;
				}
			});
		},
	},
});