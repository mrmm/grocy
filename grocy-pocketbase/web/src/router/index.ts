import { createRouter, createWebHistory } from 'vue-router';
import StockDashboard from '../views/StockDashboard.vue';

const routes = [
	{ path: '/', redirect: '/stock' },
	{ path: '/stock', component: StockDashboard },
];

export default createRouter({
	history: createWebHistory(),
	routes,
});