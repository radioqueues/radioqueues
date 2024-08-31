import { Injectable } from "@angular/core";

@Injectable()
export class FileSystemService {
	worker: Worker;
	rootHandle?: FileSystemDirectoryHandle;

	constructor() {
		this.worker = new Worker(new URL('./filesystem.worker', import.meta.url));
		this.worker.onmessage = ({ data }) => {
			if (data.cmd === "getFilesRecursively") {
				console.log(data.result);
			}
		};
	}

	async pickRoot() {
		this.rootHandle = await (window as any).showDirectoryPicker({
			id: "QueueManager",
			mode: "readwrite",
			startIn: "music"
		});

		this.worker.postMessage({
			cmd: "getFilesRecursively",
			rootHandle: this.rootHandle,
			handle: this.rootHandle
		});
	}

}
