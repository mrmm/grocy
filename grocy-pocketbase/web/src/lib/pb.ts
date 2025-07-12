import PocketBase from 'pocketbase';

const baseUrl = import.meta.env.VITE_PB_URL || '/';

export const pb = new PocketBase(baseUrl);

// auto-auth refresh if token in localStorage
const authData = localStorage.getItem('pb_auth');
if (authData) {
	pb.authStore.loadFromCookie(authData);
}

pb.authStore.onChange(() => {
	localStorage.setItem('pb_auth', pb.authStore.exportToCookie());
});