import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useChoresStore } from '../src/stores/chores';

const mockChores = [
	{ id: 'c1', name: 'Clean kitchen', next_execution: '2025-07-15' },
];

vi.mock('../src/lib/pb', () => {
	return {
		pb: {
			collection: () => ({
				getFullList: vi.fn().mockResolvedValue(mockChores),
				unsubscribe: vi.fn(),
				subscribe: vi.fn(),
			}),
		},
	};
});

// mock fetch for execute
(globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: true });

describe('chores store', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('fetches chores list', async () => {
		const store = useChoresStore();
		await store.fetch();
		expect(store.chores.length).toBe(1);
		expect(store.error).toBeNull();
	});

	it('executes a chore', async () => {
		const store = useChoresStore();
		await store.execute('c1');
		expect((globalThis as any).fetch).toHaveBeenCalled();
	});
}); 