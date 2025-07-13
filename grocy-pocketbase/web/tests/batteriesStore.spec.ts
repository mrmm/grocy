import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBatteriesStore } from '../src/stores/batteries';

const mockBats = [{ id: 'b1', name: 'AA', next_charge: '2025-07-20' }];

vi.mock('../src/lib/pb', () => {
	return {
		pb: {
			collection: () => ({
				getFullList: vi.fn().mockResolvedValue(mockBats),
				unsubscribe: vi.fn(),
				subscribe: vi.fn(),
			}),
		},
	};
});

describe('batteries store', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('fetches batteries list', async () => {
		const store = useBatteriesStore();
		await store.fetch();
		expect(store.batteries.length).toBe(1);
		expect(store.error).toBeNull();
	});
}); 