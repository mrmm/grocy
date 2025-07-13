import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ProductList from '../src/components/ProductList.vue';

describe('ProductList', () => {
	it('renders', () => {
		const wrapper = mount(ProductList, {
			global: {
				plugins: [createTestingPinia()],
			},
		});
		expect(wrapper.exists()).toBe(true);
	});
});