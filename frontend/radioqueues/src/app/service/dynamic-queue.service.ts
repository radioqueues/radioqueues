import { Injectable, inject } from "@angular/core";
import { DatabaseService } from "./database.service";
import { SECONDS, MINUTES, HOURS } from "../model/time";
import { ErrorService } from "./error.service";
import { FileMetaData } from "../model/file-meta-data";

class Item {
	constructor(
		public name: string,
		public duration: number,
		public lastPlayedAge: number) { }
}

@Injectable({
	providedIn: 'root'
})
export class DynamicQueueService {
	private databaseService = inject(DatabaseService);
	private errorService = inject(ErrorService);

	public async scheduleQueue(queueTypeName: string, duration: number) {
		while (duration > 70 * MINUTES) {
			// TODO: for realy long duration, just pick long files, subset-sum is too expensive
			duration = duration - 1 * HOURS;
		}
		let list = await this.createMusicFileList(queueTypeName, 50);
		if (!list || !list.length) {
			this.errorService.errorDialog("Cannot find files for subset-sum queue type " + queueTypeName);
			return;
		}

		let result = this.pickMusicSubset(list, duration, 30 * SECONDS);
		if (!result.totalDuration) {
			result = this.pickMusicSubset(list, duration, 60 * SECONDS);
		}
		if (!result.totalDuration) {
			if (duration > 3 * MINUTES || list.length < 20) {
				console.log("unused:", list);
				list = await this.createMusicFileList(queueTypeName, 80);
				result = this.pickMusicSubset(list!, duration, 30 * SECONDS);
				if (!result.totalDuration) {
					result = this.pickMusicSubset(list!, duration, 60 * SECONDS);
					if (!result.totalDuration) {
						result = this.pickMusicSubset(list!, duration, 5 * MINUTES);
					}
				}
			}
		}

		if (result.indexes) {
			console.log(list?.length, (result.totalDuration - duration) / SECONDS, result);
			return result.names;
		}


		// TODO: do something useful
		return undefined;
	}

	private async createMusicFileList(queueTypeName: string, percentage: number) {
		let folder = await this.getFolderFromQueueTypeName(queueTypeName);
		let files = await this.databaseService.getFiles();
		let list = this.createMusicFileListFromFolder(files, folder);
		return this.getFilesNotRecentlyPlayed(list, percentage);
	}


	private async getFolderFromQueueTypeName(queueTypeName: string) {
		let queueTypes = await this.databaseService.getQueueTypes();
		let queueType = queueTypes[queueTypeName];
		return queueType?.folder;
	}

	createMusicFileListFromFolder(files: Record<string, FileMetaData>, folder?: string) {
		if (!folder) {
			return [];
		}

		if (!folder.endsWith("/")) {
			folder = folder + "/";
		}
		let list: Item[] = [];
		let now = new Date();
		for (let filename in files) {
			let file = files[filename];
			if (filename.startsWith(folder) && file.duration && file.duration > 0) {
				let age = Number.POSITIVE_INFINITY;
				if (file.lastPlayed?.length) {
					age = now.getTime() - file.lastPlayed[file.lastPlayed.length - 1].getTime();
				}
				list.push(new Item(filename, file.duration, age));
			}
		}
		return list;
	}

	getFilesNotRecentlyPlayed(musicFiles: Item[], percentage: number): Array<Item> {
		const filesToKeep = Math.ceil(musicFiles.length * (percentage / 100));
		musicFiles.sort((a, b) => b.lastPlayedAge - a.lastPlayedAge);
		return musicFiles.slice(0, filesToKeep);
	}

	pickMusicSubset(musicFiles: Array<Item>, targetTime: number, tolerance: number) {
		// generated by ChatGPT with small adjustments
		// https://chatgpt.com/share/34e37503-2bdf-478d-a6c1-a364ae519870
		// 1. prompt: Please write a JavaScript program for me. I have a pool of music files with various durations.
		//            I want to pick a subset of music files so that the music plays for x minutes.
		// 2. prompt: This works perfectly correct. But it is too slow.
		// 3. prompt: It's still too slow. Any result that is within 10 seconds of the target duration is okay.

		// Sort the music files in descending order by duration
		musicFiles.sort((a, b) => b.duration - a.duration);

		let bestSubset: Array<number> = [];
		let bestDuration = 0;

		const startTime = Date.now();

		function backtrack(index: number, currentSubset: Array<number>, currentDuration: number) {
			// Early exit if within the acceptable margin
			if (Math.abs(currentDuration - targetTime) <= tolerance) {
				bestSubset = [...currentSubset];
				bestDuration = currentDuration;
				return true; // Found a close enough match
			}

			// If current duration exceeds target or if no more files are available, stop exploring
			if (currentDuration > targetTime || index === musicFiles.length) {
				return false;
			}

			// Try including the current file
			if (currentDuration + musicFiles[index].duration <= targetTime + tolerance) {
				currentSubset.push(index);
				if (backtrack(index + 1, currentSubset, currentDuration + musicFiles[index].duration)) {
					return true;
				}
				currentSubset.pop(); // Backtrack
			}

			if (Date.now() - startTime > 3000) {
				console.error("Timeout of pickMusicSubset.");
				return false;
			}

			// Try excluding the current file
			return backtrack(index + 1, currentSubset, currentDuration);
		}

		// Start the backtracking process
		backtrack(0, [], 0);
		let durations: Array<number> = [];
		let names: Array<string> = [];
		for (let i = 0; i < bestSubset.length; i++) {
			durations.push(musicFiles[bestSubset[i]].duration);
			names.push(musicFiles[bestSubset[i]].name);
		}

		return {
			totalDuration: bestDuration,
			indexes: bestSubset,
			files: durations,
			names: names
		};
	}

}