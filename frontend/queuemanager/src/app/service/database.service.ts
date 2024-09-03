import { Injectable, inject } from "@angular/core";
import { FileSystemService } from "./filesystem.service";
import { Queue } from "../model/queue";
import { QueueType } from "../model/queue-type";
import { FileMetaData } from "../model/file-meta-data";

@Injectable()
export class DatabaseService {
	fileSystemService = inject(FileSystemService);

	private inited = false;
	private queues: Record<string, Queue> = {};
	private queueTypes: Record<string, QueueType> = {};
	private files: Record<string, FileMetaData> = {};
	
	private async init() {
		await this.fileSystemService.init();
		this.files = await this.fileSystemService.getJsonFromFilename("queuemanager/files.json")
		this.queues = await this.fileSystemService.getJsonFromFilename("queuemanager/queues.json");
		this.queueTypes = await this.fileSystemService.getJsonFromFilename("queuemanager/queue-types.json")
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