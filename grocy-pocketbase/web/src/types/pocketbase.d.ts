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

	export default class PocketBase {
		constructor(url: string);
		readonly authStore: {
			model: AuthModel | null;
			clear(): void;
		};
		collection(name: string): {
			getFullList<T extends RecordModel>(opts?: any): Promise<T[]>;
			getList<T extends RecordModel>(page: number, perPage: number, opts?: any): Promise<ListResult<T>>;
			authWithPassword(email: string, password: string): Promise<void>;
			subscribe<T extends RecordModel>(topic: string, cb: (e: RealtimeEvent<T>) => void): void;
			unsubscribe(topic: string): void;
		};
	}
}