import { Injectable, inject } from "@angular/core";
import { FileSystemService } from "./filesystem.service";
import { DatabaseService } from "./database.service";
import { Subject } from "rxjs";

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

	private async loadDurations(loadedFiles: any) {
		let files = await this.databaseService.getFiles();
		this.process.next({
			count: Object.keys(loadedFiles).length,
			current: 0
		});
		console.log(files);
		let i = 0;
		for (let filename in loadedFiles) {
			i++;
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
			this.process.next({
				count: Object.keys(loadedFiles).length,
				current: i
			});
		}
		console.log(files);
		this.process.next(undefined);
	}

}