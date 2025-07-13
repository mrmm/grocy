import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserSettingsStore } from '../src/stores/userSettings';

// helper to mock fetch responses
function mockFetchOnce(json: any, ok = true) {
	(globalThis as any).fetch = vi.fn().mockResolvedValue({
		ok,
		json: async () => json,
	});
}

describe('user settings store', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('fetches settings', async () => {
		mockFetchOnce({ settings: { darkMode: true } });
		const store = useUserSettingsStore();
		await store.fetch();
		expect(store.settings.darkMode).toBe(true);
		expect(store.error).toBeNull();
	});

	it('saves settings', async () => {
		mockFetchOnce({}, true); // save returns empty object
		const store = useUserSettingsStore();
		await store.save({ language: 'en' });
		expect(store.settings.language).toBe('en');
		expect(store.error).toBeNull();
	});
}); 