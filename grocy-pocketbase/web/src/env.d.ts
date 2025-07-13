/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PB_URL?: string;
	// add more env vars here
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module '*.vue' {
	import { DefineComponent } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}