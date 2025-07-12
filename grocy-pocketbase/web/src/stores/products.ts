import { defineStore } from 'pinia';
import { pb } from '../lib/pb';
import type { RecordModel } from 'pocketbase';

interface ProductsState {
	products: RecordModel[];
	loading: boolean;
}

export const useProductStore = defineStore('products', {
	state: (): ProductsState => ({
		products: [],
		loading: false,
	}),
	actions: {
		async fetch() {
			if (this.products.length) return; // cache
			this.loading = true;
			this.products = await pb.collection('products').getFullList({
				sort: "name",
				expand: 'location,qu_stock',
			});
			this.loading = false;

			// realtime
			pb.collection('products').subscribe('*', (e) => {
				const idx = this.products.findIndex((p) => p.id === e.record.id);
				if (e.action === 'delete') {
					if (idx !== -1) this.products.splice(idx, 1);
				} else {
					if (idx === -1) this.products.push(e.record);
					else this.products[idx] = e.record;
				}
			});
		},
	},
});