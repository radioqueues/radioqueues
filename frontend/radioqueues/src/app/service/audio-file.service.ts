import { Injectable, inject } from "@angular/core";
import { FileSystemService } from "./filesystem.service";
import { DatabaseService } from "./database.service";
import { Subject } from "rxjs";
import { FileMetaData } from "../model/file-meta-data";

@Injectable()
export class AudioFileService {
	fileSystemService = inject(FileSystemService);
	databaseService = inject(DatabaseService);
	process: Subject<any> = new Subject();

	init() {
		console.log("AudioFileService");
		this.fileSystemService.newFiles.subscribe((loadedFiles: any) => {
			this.loadDurations(loadedFiles);
		})
	};

	private isFileKnown(files: Record<string, FileMetaData>, filename: string, metadata: FileMetaData): boolean {
		let known = files[filename];
		if (!known) {
			return false;
		}
		return known.size === metadata.size && known.lastModified === metadata.lastModified;
	}

	private async loadDurations(loadedFiles: any) {
		let files = await this.databaseService.getFiles();
		this.process.next({
			count: Object.keys(loadedFiles).length,
			current: 0
		});
		let i = 0;
		for (let filename in loadedFiles) {
			i++;
			if (this.isFileKnown(files, filename, loadedFiles[filename])) {
				continue;
			}
			let fileHandle = await this.fileSystemService.getFileHandle(filename);
			let blob = await fileHandle?.getFile();
			if (blob) {
				let audio = new Audio();
				audio.src = URL.createObjectURL(blob!)
				audio.addEventListener("loadedmetadata", () => {
					loadedFiles[filename].duration = audio.duration * 1000;
				})
				audio.addEventListener("error", (event) => {
					loadedFiles[filename].duration = undefined;
					console.log("error", filename, event);
				});
			} else {
				console.log("File not found", filename);
				loadedFiles[filename].duration = undefined;
			}
			files[filename] = loadedFiles[filename];
			this.process.next({
				count: Object.keys(loadedFiles).length,
				current: i
			});
		}
		this.databaseService.saveFiles();
		this.process.next(undefined);
		if (!this.databaseService.loaded) {
			window.location.reload();
		}
	}

}