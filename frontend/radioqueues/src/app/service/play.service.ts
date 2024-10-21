import { Injectable, inject } from "@angular/core";
import { Entry } from "../model/entry";
import { DatabaseService } from "./database.service";
import { ErrorService } from "./error.service";
import { QueueService } from "./queue.service";
import { Queue } from "../model/queue";

@Injectable()
export class PlayService {
	databaseService = inject(DatabaseService);
	errorService = inject(ErrorService);
	queueService = inject(QueueService);
	queues!: Record<string, Queue>;

	constructor() {
		this.init();
	}

	async init() {
		this.queues = await this.databaseService.getQueues();
	}

	pickNext() {
		let queue = this.queueService.getQueueByType("Main Queue")!;
		if (!queue || !queue.entries?.length) {
			this.errorService.errorDialog("No Main Queue or Main Queue is empty");
			return;
		}
		
		let entry: Entry|undefined;
		let path: Entry[] = [];
		while (queue) {
			entry = this.queueService.getEntryByTime(queue, new Date());
			if (!entry) {
				break;
			}
			path.push(entry);
			if (entry?.queueRef) {
				queue = this.queues[entry.queueRef];
			}
		}
		return path;
	}
}