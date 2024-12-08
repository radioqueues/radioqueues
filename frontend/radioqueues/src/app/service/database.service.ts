import { Injectable, inject } from "@angular/core";
import { FileSystemService } from "./filesystem.service";
import { Queue } from "../model/queue";
import { QueueType } from "../model/queue-type";
import { FileMetaData } from "../model/file-meta-data";
import { DateTimeUtil } from "../util/date-time-util";

@Injectable({
	providedIn: 'root'
})
export class DatabaseService {
	fileSystemService = inject(FileSystemService);

	private inited = false;

	private queues: Record<string, Queue> = {
		"00000000-a78095b4-0c65-44a7-9555-bdcbd93d00a6": {
			"uuid": "00000000-a78095b4-0c65-44a7-9555-bdcbd93d00a6",
			"name": "History",
			"type": "History",
			"visible": true,
			"entries": []
		},

		"00000001-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b": {
			"uuid": "00000001-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b",
			"name": "Main Queue",
			"type": "Main Queue",
			"visible": true,
			"entries": []
		}
	};

	private queueTypes: Record<string, QueueType> = {
		"History": {
			"name": "History",
			"scheduleStrategy": "internal"
		},
		"Main Queue": {
			"name": "Main Queue",
			"scheduleStrategy": "internal"
		},
		"News": {
			"name": "News",
			"color": "#0A0",
			"scheduleTime": "xx:00:00",
			"scheduleStrategy": "clone"
			},
		"Music Request": {
			"name": "Music Request",
			"color": "#00A",
			"scheduleStrategy": "manual"
		},
		"Advertisment": {
			"name": "Advertisment",
			"color": "#A0A",
			"scheduleTime": "xx:15:00, xx:45:00",
			"scheduleStrategy": "manual",
		},
		"Music": {
			"name": "Music",
			"color": "#AAA",
			"scheduleStrategy": "subset-sum",
			"folder": "Musik"
		}
		
	};

	private files: Record<string, FileMetaData> = {};

	private jsonDeserializer(key: string, value: any): any {
		if ((key === "offset") || (key === "scheduled")) {
			return new Date(value);
		}
		if (key === "lastPlayed") {
			let res: Date[] = [];
			for (let v of value) {
				res.push(new Date(v));
			}
			return res;
		}
		return value;
	}
	
	public async init() {
		await this.fileSystemService.init();
		if (!this.fileSystemService.rootHandle) {
			console.error("Called DatabaseService.init without valid FileSystemService.rootHandle");
			return;
		}
			
		try {
			let queues = await this.fileSystemService.getJsonFromFilename("radioqueues/queues.json", this.jsonDeserializer);
			if (queues.debugForceToday) {
				DatabaseService.debugForceToday(queues);
			}
			this.queues = queues;
		} catch(e) {
			console.log("loading queues", e);
		}
		try {
			this.queueTypes = await this.fileSystemService.getJsonFromFilename("radioqueues/queue-types.json")
		} catch(e) {
			console.log("loading queueTypes", e);
		}

		try {
			this.files = await this.fileSystemService.getJsonFromFilename("radioqueues/files.json", this.jsonDeserializer)
		} catch (e) {
			console.log("loading files", e);
		}
		this.inited = true;
	}

	public async saveFiles() {
		await this.fileSystemService.saveJsonToFilename("radioqueues/files.json", this.files);
	}

	public async saveQueues() {
		await this.fileSystemService.saveJsonToFilename("radioqueues/queues.json", this.queues);
	}

	public async getQueues(): Promise<Record<string, Queue>> {
		if (!this.inited) {
			await this.init();
		}
		return this.queues;
	}

	public async getQueueTypes(): Promise<Record<string, QueueType>> {
		if (!this.inited) {
			await this.init();
		}
		return this.queueTypes;
	}


	public async getFiles(): Promise<Record<string, FileMetaData>> {
		if (!this.inited) {
			await this.init();
		}
		return this.files;
	}

	private static debugForceToday(queues: Record<string, Queue>) {
		let now = new Date();

		for (let queue of Object.values(queues)) {
			if (queue.scheduled) {
				DateTimeUtil.changeDateTimeToDate(queue.scheduled, now);
			}
			if (queue.offset) {
				DateTimeUtil.changeDateTimeToDate(queue.offset, now);
			}
			if (queue.entries) {
				for (let entry of queue.entries) {
					if (entry.scheduled) {
						DateTimeUtil.changeDateTimeToDate(entry.scheduled, now);
					}
					if (entry.offset) {
						DateTimeUtil.changeDateTimeToDate(entry.offset, now);
					}
				}
			}
		}
	}
}