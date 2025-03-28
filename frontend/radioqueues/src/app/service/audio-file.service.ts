import { Injectable, inject } from "@angular/core";
import { FileSystemService } from "./filesystem.service";
import { DatabaseService } from "./database.service";
import { FileMetaData } from "../model/file-meta-data";
import { ProgressStatusService } from "./progress-status.service";

@Injectable({
	providedIn: 'root'
})
export class AudioFileService {
	private databaseService = inject(DatabaseService);
	private fileSystemService = inject(FileSystemService);
	private progressStatusService = inject(ProgressStatusService);

	init() {
		this.fileSystemService.newFiles.subscribe(async (loadedFiles: any) => {
			await this.markMissingFilesAsInvalid(loadedFiles);
			await this.loadDurations(loadedFiles);
		})
	}

	private isFileKnown(files: Record<string, FileMetaData>, filename: string, metadata: FileMetaData): boolean {
		let known = files[filename];
		if (!known) {
			return false;
		}
		return known.size === metadata.size && known.lastModified === metadata.lastModified;
	}

	private updateStatus(current: number, count: number) {
		this.progressStatusService.next({
			current: current,
			count: count,
			message: "Reading duration of audio files"
		});
	}

	private async markMissingFilesAsInvalid(loadedFiles: any) {
		let files = await this.databaseService.getFiles();
		for (let filename in files) {
			if (!loadedFiles[filename]) {
				files[filename].valid = false;
			}
		}
		await this.databaseService.saveFiles();
	}

	async loadDurations(loadedFiles: any) {
		let files = await this.databaseService.getFiles();
		let i = 0;
		let count = Object.keys(loadedFiles).length;
		this.updateStatus(i, count);

		// do not use an async for loop because it would do all disk reads first and then all calculations
		for (let filename in loadedFiles) {
			if (this.isFileKnown(files, filename, loadedFiles[filename]) || filename.endsWith(".json")) {
				i++;
				this.updateStatus(i, Object.keys(loadedFiles).length);
				continue;
			}
			let promise = new Promise<void>(async (resolve) => {
				let fileHandle = await this.fileSystemService.getFileHandle(filename);
				let blob = await fileHandle?.getFile();
				if (blob) {
					let audio = new Audio();
					audio.src = URL.createObjectURL(blob!)
					audio.addEventListener("loadedmetadata", () => {
						loadedFiles[filename].duration = audio.duration * 1000;
						loadedFiles[filename].valid = true;
						i++;
						this.updateStatus(i, count);
						resolve();
					})
					audio.addEventListener("error", (event) => {
						loadedFiles[filename].duration = undefined;
						loadedFiles[filename].valid = false;
						console.log("error", filename, event);
						i++;
						this.updateStatus(i, count);
						resolve();
					});
				} else {
					console.log("File not found", filename);
					loadedFiles[filename].duration = undefined;
					loadedFiles[filename].valid = false;
					i++;
					this.updateStatus(i, count);
					resolve();
				}
				files[filename] = loadedFiles[filename];
			});
			await promise;
		}
		await this.databaseService.saveFiles();
		this.progressStatusService.next(undefined);
	}

	async markFileAsPlayed(filename: string) {
		let files = await this.databaseService.getFiles();
		let fileInfo = files[filename];
		if (fileInfo) {
			if (!fileInfo.lastPlayed) {
				fileInfo.lastPlayed = [];
			}
			fileInfo.lastPlayed.push(new Date());
		}
		await this.databaseService.saveFiles();
	}
}