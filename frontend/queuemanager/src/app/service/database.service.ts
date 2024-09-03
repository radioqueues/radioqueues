import { Injectable, inject } from "@angular/core";
import { FileSystemService } from "./filesystem.service";
import { Queue } from "../model/queue";
import { QueueType } from "../model/queue-type";
import { FileMetaData } from "../model/file-meta-data";

@Injectable()
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
	
	private async init() {
		await this.fileSystemService.init();
		if (!this.fileSystemService.rootHandle) {
			return;
		}
		try {
			this.files = await this.fileSystemService.getJsonFromFilename("queuemanager/files.json")
		} catch (e) {
			console.log("loading files", e);
		}
		try {
			this.queues = await this.fileSystemService.getJsonFromFilename("queuemanager/queues.json");
		} catch(e) {
			console.log("loading queues", e);
		}
			
		try {
			this.queueTypes = await this.fileSystemService.getJsonFromFilename("queuemanager/queue-types.json")
		} catch(e) {
			console.log("loading queueTypes", e);
		}
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
}