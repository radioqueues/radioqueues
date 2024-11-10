import { Injectable } from "@angular/core";

@Injectable()
export class IndexeddbCacheService {

	// Define the database name and store name
	readonly DB_NAME = 'file-system-access-db';
	readonly STORE_NAME = 'handles';

	/**
	 * Initializes the IndexedDB database.
	 */
	initDB(): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.DB_NAME, 1);

			request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
				const db = (event.target as IDBOpenDBRequest).result;
				db.createObjectStore(this.STORE_NAME);
			};

			request.onsuccess = (event: Event) => {
				resolve((event.target as IDBOpenDBRequest).result);
			};

			request.onerror = (event: Event) => {
				reject('Database error: ' + (event.target as IDBOpenDBRequest).error);
			};
		});
	}

	/**
	 * Saves the directory handle to IndexedDB.
	 * @param dirHandle - The directory handle to save.
	 */
	async saveDirectoryHandle(dirHandle?: FileSystemDirectoryHandle): Promise<void> {
		const db = await this.initDB();
		const transaction = db.transaction(this.STORE_NAME, 'readwrite');
		const store = transaction.objectStore(this.STORE_NAME);

		// Use put to store the handle
		return new Promise((success, failure) => {
			const request = store.put(dirHandle, 'directory-handle');
			request.onsuccess = () => {
				console.log('Directory handle saved to IndexedDB.');
				success();
			};

			request.onerror = (event) => {
				console.error('Failed to save directory handle:', (event.target as IDBRequest).error);
				failure();
			};
		});
	}

	/**
	 * Retrieves the saved directory handle from IndexedDB.
	 * @returns The retrieved directory handle or null if not found.
	 */
	async getSavedDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
		const db = await this.initDB();
		const transaction = db.transaction(this.STORE_NAME, 'readonly');
		const store = transaction.objectStore(this.STORE_NAME);

		return new Promise((resolve, reject) => {
			const request = store.get('directory-handle');

			request.onsuccess = (event: Event) => {
				const dirHandle = (event.target as IDBRequest).result;
				if (dirHandle) {
					resolve(dirHandle as FileSystemDirectoryHandle); // Retrieved handle is valid
				} else {
					resolve(null); // No handle found
				}
			};

			request.onerror = (event: Event) => {
				reject('Failed to retrieve directory handle: ' + (event.target as IDBRequest).error);
			};
		});
	}
}