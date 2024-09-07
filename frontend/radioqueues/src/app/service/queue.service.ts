import { Injectable, inject } from "@angular/core";
import { Entry } from "../model/entry";
import { Queue } from "../model/queue";
import { QueueType } from "../model/queue-type";
import { DatabaseService } from "./database.service";

@Injectable()
export class QueueService {

	readonly databaseService = inject(DatabaseService);

	queueTypes!: Record<string, QueueType>;
	queues!: Record<string, Queue>;

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

	getQueueByType(queueTypeName: string): Queue|undefined {
		if (!this.queues) {
			return undefined;
		}
		for (let queue of Object.values(this.queues)) {
			if (queue.name === queueTypeName) {
				return queue;
			}
		}
		return undefined;
	}

	private showQueueByTypeName(queueTypeName: string) {
		let queue = this.getQueueByType(queueTypeName);
		if (queue) {
			queue.visible = true;
		}
	}

	createNewQueue(queueType: QueueType) {
		let queue = {
			uuid: Date.now().toString(36) + "-" + crypto.randomUUID(),
			name: queueType.name + " (unscheduled)",
			color: queueType.color,
			visible: true,
			type: queueType.name,
			entries: new Array<Entry>()
		};
		if (queueType.jingleStart) {
			queue.entries.push(new Entry(queueType.jingleStart, new Date("2024-01-01 00:00:00"), 0, queue.color));
		}
		if (queueType.jingleEnd) {
			queue.entries.push(new Entry(queueType.jingleEnd, new Date("2024-01-01 00:00:00"), 0, queue.color));
		}
		this.queues[queue.uuid] = queue;
		return queue;
	}		

	cloneQueue(queue: Queue) {
	    let newQueue: Queue = JSON.parse(JSON.stringify(queue));
		// prefix uuid with timestamp for sorting
		newQueue.uuid = Date.now().toString(36) + "-" + crypto.randomUUID();
		newQueue.name = newQueue.type + " (unscheduled)";

		// TODO: schedule or unscheduled
		newQueue.offset = new Date("2024-01-01 00:00:00");
		this.queues[newQueue.uuid] = newQueue;
	}
}
