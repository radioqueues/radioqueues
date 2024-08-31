import { Injectable } from "@angular/core";

@Injectable()
export class FileSystemService {
	worker: Worker;
	rootHandle?: FileSystemDirectoryHandle;
	files: Record<string, any> = {};

	constructor() {
		this.worker = new Worker(new URL('./filesystem.worker', import.meta.url));
		this.worker.onmessage = ({ data }) => {
			if (data.cmd === "getFilesRecursively") {
				this.files = data.result;
				console.log(data.result);
				this.loadDurations();
			}
		};
	}

	public async getFile(filename: string) {
		let components = filename.split("/");
		let directory = this.rootHandle;
		for (let i = 0; i < components.length - 1; i++) {
			directory = await directory?.getDirectoryHandle(components[i]);
		}
		let fileHandle = await directory?.getFileHandle(components[components.length - 1]);
		return await fileHandle?.getFile();
	}

	private async loadDurations() {
		for (let filename in this.files) {
			let blob = await this.getFile(filename);
			if (blob) {
				let audio = new Audio();
				audio.src = URL.createObjectURL(blob!)
				audio.addEventListener("loadedmetadata", () => {
					console.log("loaded", filename, audio.duration);
					this.files[filename].duration = audio.duration;
				})
				audio.addEventListener("error", (event) => {
					this.files[filename].duration = -1;
					console.log("error", filename, event);
				});
			} else {
				console.log("File not found", filename);
				this.files[filename].duration = -1;
			}
		}
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
