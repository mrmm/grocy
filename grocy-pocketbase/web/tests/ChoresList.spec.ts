import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ChoresList from '../src/components/ChoresList.vue';

// mock chores store via pinia testing plugin

describe('ChoresList', () => {
	it('renders list heading', () => {
		const wrapper = mount(ChoresList, {
			global: { plugins: [createTestingPinia()] },
		});
		expect(wrapper.find('h2').text()).toBe('Chores');
	});
}); 