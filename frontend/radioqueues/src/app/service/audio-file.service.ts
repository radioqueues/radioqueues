import { Injectable, inject } from "@angular/core";
import { FileSystemService } from "./filesystem.service";
import { DatabaseService } from "./database.service";

@Injectable()
export class AudioFileService {
	fileSystemService = inject(FileSystemService);
	databaseService = inject(DatabaseService);

	init() {
		console.log("AudioFileService");
		this.fileSystemService.newFiles.subscribe((loadedFiles: any) => {
			this.loadDurations(loadedFiles);
		})
	};

	private async loadDurations(loadedFiles: any) {
		let files = await this.databaseService.getFiles();
		console.log(files);
		for (let filename in loadedFiles) {
			let blob = await this.fileSystemService.getFile(filename);
			if (blob) {
				let audio = new Audio();
				audio.src = URL.createObjectURL(blob!)
				audio.addEventListener("loadedmetadata", () => {
					console.log("loaded", filename, audio.duration);
					loadedFiles[filename].duration = audio.duration;
				})
				audio.addEventListener("error", (event) => {
					loadedFiles[filename].duration = -1;
					console.log("error", filename, event);
				});
			} else {
				console.log("File not found", filename);
				loadedFiles[filename].duration = -1;
			}
			files[filename] = loadedFiles[filename];
		}
		console.log(files);
	}

}