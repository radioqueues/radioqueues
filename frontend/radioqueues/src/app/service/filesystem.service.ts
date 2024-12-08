import { Injectable, inject } from "@angular/core";
import { IndexeddbCacheService } from "./indexeddb-cache.service";
import { Subject } from "rxjs";
import { ProgressStatusService } from "./progress-status.service";
import { ErrorService } from "./error.service";

@Injectable({
	providedIn: 'root'
})
export class FileSystemService {
	worker: Worker;
	rootHandle?: FileSystemDirectoryHandle;
	newFiles: Subject<any> = new Subject();

	private errorService = inject(ErrorService);
	private indexeddbCacheService = inject(IndexeddbCacheService);
	private progressStatusService = inject(ProgressStatusService);

	constructor() {
		this.worker = new Worker(new URL('./filesystem.worker', import.meta.url));
		this.worker.onmessage = ({ data }) => {
			if (data.cmd === "getFilesRecursively") {
				this.newFiles.next(data.result);
			}
		};
	}

	public async init() {
		let handle = await this.indexeddbCacheService.getSavedDirectoryHandle() as any;
		let permission = await handle?.queryPermission({ mode: 'readwrite' });
		console.log("loaded directory handle", handle, permission);
		if (permission === 'granted') {
		    this.rootHandle = handle;
		}
	}

	public async getJsonFromFilename(filename: string, deserializer?: any) {
		let fileHandle = await this.getFileHandle(filename);
		let file = await fileHandle?.getFile();
		let text = await file?.text();
		if (text) {
			try {
				return JSON.parse(text, deserializer);
			} catch (e) {
				this.errorService.errorDialog("Cannot read file " + filename + ": " + e);
			}
		}
		return undefined;
	}

	public async saveJsonToFilename(filename: string, data: object) {
		let fileHandle = await this.getFileHandle(filename, {create: true});
		const stream = await fileHandle!.createWritable();
		const json = JSON.stringify(data, null, 2);
		await stream.write(json);
		await stream.close();
	}

	public async getFileHandle(filename: string, options?: FileSystemGetFileOptions) {
		if (!this.rootHandle) {
			return undefined;
		}
		let components = filename.split("/");
		let directory = this.rootHandle;
		for (let i = 0; i < components.length - 1; i++) {
			directory = await directory?.getDirectoryHandle(components[i], options);
		}
		let fileHandle = await directory?.getFileHandle(components[components.length - 1], options);
		return fileHandle;
	}

	async pickRoot() {
		console.log("Show directory picker");
		this.rootHandle = await (window as any).showDirectoryPicker({
			id: "QueueManager",
			mode: "readwrite",
			startIn: "music"
		});
		console.log("Picked directory: ", this.rootHandle);

		return this.indexeddbCacheService.saveDirectoryHandle(this.rootHandle);
	}

	scanFiles() {
		this.progressStatusService.next({
			message: "Listing folder content..."
		});

		this.worker.postMessage({
			cmd: "getFilesRecursively",
			rootHandle: this.rootHandle,
			handle: this.rootHandle
		});
	}

}
