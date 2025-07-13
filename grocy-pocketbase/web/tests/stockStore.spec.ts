import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStockStore } from '../src/stores/stock';

const mockEntries = [
	{ id: 'e1', product: 'p1', amount: 2 },
	{ id: 'e2', product: 'p1', amount: 3 },
	{ id: 'e3', product: 'p2', amount: 1 },
];

vi.mock('../src/lib/pb', () => {
	return {
		pb: {
			collection: () => ({
				getFullList: vi.fn().mockResolvedValue(mockEntries),
				subscribe: vi.fn(),
			}),
		},
	};
});

// mock window.fetch to avoid errors during purchase/consume calls
// @ts-ignore
window.fetch = vi.fn();

describe('stock store', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('fetches entries and calculates totals', async () => {
		const store = useStockStore();
		await store.fetch();
		expect(store.entries.length).toBe(3);
		expect(store.totals['p1']).toBe(5);
		expect(store.totals['p2']).toBe(1);
	});
}); 