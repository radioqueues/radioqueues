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
		if (queueType.jingleStart) {
			queue.entries.push(new Entry(queueType.jingleStart, "2024-01-01 00:00:00", 0, queue.color));
		}
		if (queueType.jingleEnd) {
			queue.entries.push(new Entry(queueType.jingleEnd, "2024-01-01 00:00:00", 0, queue.color));
		}
		this.queues.push(queue);
	}		

	cloneQueue(queue: Queue) {
	    let newQueue: Queue = JSON.parse(JSON.stringify(queue));
		newQueue.name = newQueue.type + " (unscheduled)";

		// TODO: schedule or unscheduled
		newQueue.offset = "2024-01-01 00:00:00";
		this.queues.push(newQueue);
	}
}
