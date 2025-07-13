import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Mock pocketbase client before importing the store
vi.mock('../src/lib/pb', () => {
	const mockAuthStore = {
		model: null as any,
		token: '',
		isValid: false,
		clear: vi.fn(() => {
			mockAuthStore.model = null;
		}),
		exportToCookie: vi.fn(),
		loadFromCookie: vi.fn(),
		onChange: vi.fn(),
	};

	return {
		pb: {
			authStore: mockAuthStore,
			collection: () => ({
				authWithPassword: vi.fn(async () => {
					mockAuthStore.model = { id: 'u1', email: 'test@example.com', verified: true };
				}),
			}),
		},
	};
});

// now import after mocks are in place
import { useAuthStore } from '../src/stores/auth';
import { pb } from '../src/lib/pb';

describe('auth store', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		(pb.authStore as any).model = null;
	});

	it('logs in and sets user', async () => {
		const store = useAuthStore();
		expect(store.user).toBeNull();
		await store.login('test@example.com', 'secret');
		expect(store.user).not.toBeNull();
		expect(store.error).toBeNull();
	});

	it('logs out and clears user', () => {
		const store = useAuthStore();
		(pb.authStore as any).model = { id: 'u1' };
		store.logout();
		expect(store.user).toBeNull();
		expect(pb.authStore.clear).toHaveBeenCalled();
	});
}); 