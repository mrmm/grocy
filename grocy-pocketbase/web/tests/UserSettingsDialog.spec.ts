import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import UserSettingsDialog from '../src/components/UserSettingsDialog.vue';
import { nextTick } from 'vue';

// mock fetch success
(globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

describe('UserSettingsDialog', () => {
	it('renders and saves', async () => {
		const wrapper = mount(UserSettingsDialog, {
			global: { plugins: [createTestingPinia()] },
		});
		// change checkbox
		await wrapper.find('input[type="checkbox"]').setValue(true);
		await wrapper.find('form').trigger('submit.prevent');
		await nextTick();
		// ensure no error displayed
		expect(wrapper.find('.error').exists()).toBe(false);
	});
}); 