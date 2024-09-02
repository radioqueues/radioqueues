import { Injectable, inject } from "@angular/core";
import { Entry } from "../model/entry";
import { Queue } from "../model/queue";
import { QueueType } from "../model/queue-type";
import { DatabaseService } from "./database.service";

@Injectable()
export class QueueService {

	readonly databaseService = inject(DatabaseService);

	queueTypes!: Record<string, QueueType>;
	queues!: Queue[];

	constructor() {
		this.init();
	}
	
	private async init() {
		this.queueTypes = await this.databaseService.getQueueTypes();
		this.queues = await this.databaseService.getQueues();

	}

	createNewQueueOrShowInternalQueue(queueTypeName: string) {
		let queueType = this.queueTypes[queueTypeName];
		if (queueType.scheduleStrategy === "internal") {
			this.showQueueByTypeName(queueTypeName);
		} else {
			this.createNewQueue(queueType);
		}
	}

	showQueueByTypeName(queueTypeName: string) {
		for (let queue of this.queues) {
			if (queue.name === queueTypeName) {
				queue.visible = true;
			}
		}
	}

	createNewQueue(queueType: QueueType) {
		let queue = {
			name: queueType.name + " (unscheduled)",
			color: queueType.color,
			visible: true,
			type: queueType.name,
			entries: new Array<Entry>()
		};
		/* TODO: create entries
		if (queueType.jingleStart) {
			queue.entries.push(queueType.jingleStart);
		}
		if (queueType.jingleEnd) {
			queue.entries.push(queueType.jingleEnd);
		}*/
		this.queues.push(queue);
	}		
}
