import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProductStore } from '../src/stores/products';

vi.mock('../src/lib/pb', () => {
	return {
		pb: {
			collection: () => ({
				getFullList: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }]),
				unsubscribe: vi.fn(),
				subscribe: vi.fn(),
			}),
		},
	};
});

describe('product store', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('fetches products list', async () => {
		const store = useProductStore();
		await store.fetch();
		expect(store.products.length).toBe(1);
		expect(store.error).toBeNull();
		expect(store.loading).toBe(false);
	});
});