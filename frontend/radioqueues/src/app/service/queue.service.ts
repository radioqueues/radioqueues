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

	private getEntryRefsForQueue(queue: Queue): Entry[] {
		let uuid = queue.uuid;
		let res: Array<Entry> = [];
		for (let q of Object.values(this.queues)) {
			if (q.entries) {
				for (let entry of q.entries) {
					if (entry.queueRef === uuid) {
						res.push(entry);
					}
				}
			}
		}
		return res; 
	}

	private showQueueByTypeName(queueTypeName: string) {
		let queue = this.getQueueByType(queueTypeName);
		if (queue) {
			queue.visible = true;
		}
	}

	async createNewQueue(queueType: QueueType) {
		let queue = {
			uuid: Date.now().toString(36) + "-" + crypto.randomUUID(),
			name: queueType.name + " (unscheduled)",
			color: queueType.color,
			offset: new Date("+100000-01-01T00:00:00"),
			duration: 0,
			visible: true,
			type: queueType.name,
			entries: new Array<Entry>()
		};
		let temp = 0;
		let files = await this.databaseService.getFiles();
		if (queueType.jingleStart) {
			let duration = files[queueType.jingleStart]?.duration;
			queue.entries.push(new Entry(queueType.jingleStart, undefined, queue.offset, duration, queue.color));
			temp = duration ? duration : 0;
		}
		if (queueType.jingleEnd) {
			let duration = files[queueType.jingleEnd]?.duration;
			queue.entries.push(new Entry(queueType.jingleEnd, undefined, new Date(queue.offset.getTime() + temp), duration, queue.color));
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
		newQueue.offset = new Date("+100000-01-01T00:00:00");
		this.queues[newQueue.uuid] = newQueue;
		this.recalculateQueue(newQueue);
	}


	cloneEntry(entry: Entry): Entry {
		return new Entry(entry.name, undefined, entry.offset, entry.duration, entry.color, entry.queueRef);
	}

	private getQueueTypeFromEntry(entry?: Entry): QueueType|undefined {
		let queueTypeName = (entry as Queue).type;
		let queueRef = entry?.queueRef;
		if (queueRef) {
			queueTypeName = this.queues[queueRef]?.type;
		}
		if (!queueTypeName) {
			return undefined;
		}
		return this.queueTypes[queueTypeName];
	}

	private getSubsetSumQueueType() {
		for (let queueType of Object.values(this.queueTypes)) {
			if (queueType.scheduleStrategy === "subset-sum") {
				return queueType;
			}
		}
		console.error("No QueueType with schedule strategy 'subset-sum'");
		return undefined;
	}

	async recalculateQueue(queue: Queue) {
		let now = new Date();
		let offset = queue.offset?.getTime() || 0;
		let durationSum = 0;
		for (let i = 0; i < queue.entries.length; i++) {
			let entry = queue.entries[i];
			let start = new Date(offset + durationSum);
			if (start < now || (entry.scheduled && entry.scheduled < now)) {
				continue;
			}
			if (entry.scheduled) {
				let subsetSumQueue: Queue|undefined = undefined;

				// If this is the first entry, or the previous entry is not of type subset-sub,
				// We need to insert one.
				if (i == 0 || this.getQueueTypeFromEntry(queue.entries[i - 1])?.scheduleStrategy !== "subset-sum") {
					if (entry.scheduled > start) {
						let subsetSumQueueType = this.getSubsetSumQueueType();
						subsetSumQueue = await this.createNewQueue(subsetSumQueueType!);
						subsetSumQueue.name = subsetSumQueueType!.name,
						subsetSumQueue.offset = start;
						subsetSumQueue.visible = false;
						queue.entries.splice(i, 0, subsetSumQueue);
						i++;
					}
				} else {
					subsetSumQueue = queue.entries[i - 1] as Queue;
				}
				if (subsetSumQueue) {
					if (!subsetSumQueue.duration) {
						subsetSumQueue.duration = 0;
					}
					let diff = entry.scheduled.getTime() - (offset + durationSum);
					if (diff < 0) {
						if (subsetSumQueue.duration && subsetSumQueue.duration >= -diff) {
							subsetSumQueue.duration = subsetSumQueue.duration + diff;
							durationSum = durationSum + diff; 
						} else {
							console.error("Unable to fit schedule", entry);
							if (subsetSumQueue.duration) {
								durationSum = durationSum - subsetSumQueue.duration; 
								subsetSumQueue.duration = 0;
							}
						}
					} else if (diff > 0) {
						subsetSumQueue.duration = subsetSumQueue.duration + diff;
						durationSum = durationSum + diff; 
					}
				}

				entry.offset = new Date(offset + durationSum);;
				durationSum = durationSum + ((entry.duration && entry.duration > 0) ? entry.duration : 0);
			} else {
				entry.offset = start;
				durationSum = durationSum + ((entry.duration && entry.duration > 0) ? entry.duration : 0);
			} 
		}
		queue.duration = durationSum;

		// update references (e. g. from the Main Queue)
		for (let entry of this.getEntryRefsForQueue(queue)) {
			entry.duration = durationSum;
		}
		// TODO: recalc main queue
		// TODO: recalc all referencing queues without circle
	}
}
