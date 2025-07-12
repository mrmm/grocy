declare module 'pocketbase' {
	export interface RecordModel {
		id: string;
		[key: string]: unknown;
	}

	export interface AuthModel {
		id: string;
		email: string;
		verified: boolean;
	}

	export interface RealtimeEvent<T extends RecordModel = RecordModel> {
		action: 'create' | 'update' | 'delete';
		record: T;
	}

	export interface ListResult<T> {
		items: T[];
		page: number;
		perPage: number;
		totalItems: number;
	}

	export interface AuthStore {
		/** currently authenticated user model */
		model: AuthModel | null;
		/** raw JWT token string */
		token: string;
		/** true when token & model set */
		isValid: boolean;
		/** replace current state with cookie string obtained from exportToCookie */
		loadFromCookie(cookie: string): void;
		/** serialise current state for storage */
		exportToCookie(): string;
		/** clears token + model */
		clear(): void;
		/** subscribe to auth changes */
		onChange(cb: (token: string, model: AuthModel | null) => void): void;
	}

	export default class PocketBase {
		constructor(url: string);
		readonly authStore: AuthStore;
		collection<Name extends string>(name: Name): {
			getFullList<T extends RecordModel>(opts?: any): Promise<T[]>;
			getList<T extends RecordModel>(page: number, perPage: number, opts?: any): Promise<ListResult<T>>;
			authWithPassword(email: string, password: string): Promise<void>;
			subscribe<T extends RecordModel>(topic: string, cb: (e: RealtimeEvent<T>) => void): void;
			unsubscribe(topic: string): void;
		};
	}
}