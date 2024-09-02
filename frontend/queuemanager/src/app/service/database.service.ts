import { Injectable, inject } from "@angular/core";
import { FileSystemService } from "./filesystem.service";
import { Queue } from "../model/queue";
import { QueueType } from "../model/queue-type";

@Injectable()
export class DatabaseService {
	fileSystemService = inject(FileSystemService);

	private inited = false;
	private queues: Record<string, Queue> = {};
	private queueTypes: Record<string, QueueType> = {};
	
	private async init() {
		await this.fileSystemService.init();
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
	
}