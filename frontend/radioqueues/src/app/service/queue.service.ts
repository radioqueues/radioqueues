import { Injectable, inject } from "@angular/core";
import { Entry } from "../model/entry";
import { Queue } from "../model/queue";
import { QueueType } from "../model/queue-type";
import { DatabaseService } from "./database.service";
import { DynamicQueueService } from "./dynamic-queue.service";
import { FileMetaData } from "../model/file-meta-data";
import { DateTimeUtil } from "../util/date-time-util";

@Injectable({
	providedIn: 'root'
})
export class QueueService {

	private readonly databaseService = inject(DatabaseService);
	private readonly dynamicQueueService = inject(DynamicQueueService);

	private formatter: Intl.DateTimeFormat;
	queueTypes!: Record<string, QueueType>;
	queues!: Record<string, Queue>;
	files!: Record<string, FileMetaData>;

	constructor() {
		this.formatter = new Intl.DateTimeFormat('en-GB', {
		  hour: '2-digit',
		  minute: '2-digit',
		  hour12: false
		});
		this.init();
	}

	private async init() {
		this.queueTypes = await this.databaseService.getQueueTypes();
		this.queues = await this.databaseService.getQueues();
		this.files = await this.databaseService.getFiles();
	}

	createNewQueueOrShowInternalQueue(queueTypeName: string) {
		let queueType = this.queueTypes[queueTypeName];
		if (queueType.scheduleStrategy === "internal") {
			this.showQueueByTypeName(queueTypeName);
		} else {
			let newQueue = this.createNewQueue(queueType);
			this.enqueue(newQueue, newQueue.offset!, false);

		}
	}

	getQueueByType(queueTypeName: string): Queue | undefined {
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

	createNewQueue(queueType: QueueType): Queue {
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
		if (queueType.jingles) {
			let temp = 0;
			for (let jingle of queueType.jingles) {
				let duration = this.files[jingle]?.duration;
				queue.entries.push(new Entry(jingle, undefined, new Date(queue.offset.getTime() + temp), duration, queue.color));
				temp = duration ? duration : 0;
			}
		}
		this.recalculateQueue(queue);
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
		this.enqueue(newQueue, newQueue.offset, false);
	}


	cloneEntry(entry: Entry): Entry {
		return new Entry(entry.name, undefined, entry.offset, entry.duration, entry.color, entry.queueRef);
	}

	private getQueueTypeFromEntry(entry?: Entry): QueueType | undefined {
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

	public resolveQueue(queue: Entry): Queue {
		if (queue.queueRef) {
			let res = this.queues[queue.queueRef];
			if (res) {
				return res;
			}
		}
		return queue as Queue;
	}

	async fillQueue(entry: Entry) {
		if (!entry.duration) {
			return;
		}

		let queueType = this.getQueueTypeFromEntry(entry);
		if (queueType?.scheduleStrategy !== "subset-sum") {
			return;
		}

		if (!entry.queueRef) {
			let queue = this.createNewQueue(queueType);
			queue.name = entry.name;
			queue.offset = entry.offset;
			queue.duration = entry.duration;
			queue.visible = false;
			entry.queueRef = queue.uuid;
		}

		let queue = this.queues[entry.queueRef];
		if (queue.entries?.length) {
			return;
		}

		let filenames = await this.dynamicQueueService.scheduleQueue(queue.type, entry.duration);
		console.log("scheduling", filenames);

		let files = await this.databaseService.getFiles();
		for (let filename of filenames!) {
			let duration = files[filename]?.duration;
			queue.entries.push(new Entry(filename, undefined, queue.offset, duration, queue.color));
		}
		this.recalculateQueue(queue);
		// TODO: save used songs in DynamicQueueService
	}


	private createSubsetSumEntry(start: Date, duration: number) {
		let subsetSumQueueType = this.getSubsetSumQueueType();
		let subsetSumQueue = this.createNewQueue(subsetSumQueueType!);
		subsetSumQueue.visible = false;
		subsetSumQueue.name = subsetSumQueueType!.name;
		subsetSumQueue.offset = start;
		subsetSumQueue.visible = false;
		let entry = new Entry(subsetSumQueueType?.name, undefined, start, duration, subsetSumQueueType?.color)
		entry.queueRef = subsetSumQueue.uuid;
		return entry;
	}


	recalculateQueue(queue: Queue, save = true) {

		// do not recalculate empty queues
		// especially don't overwrite playholder duration of subset-sum queues
		if (!queue.entries.length) {
			return;
		}

		let now = new Date();
		let offset = queue.offset?.getTime() || 0;
		let durationSum = 0;
		for (let i = 0; i < queue.entries.length; i++) {
			let entry = queue.entries[i];
			let start = new Date(offset + durationSum);
			if (start < now && (!entry.scheduled || entry.scheduled < now)) {
				durationSum = durationSum + ((entry.duration && entry.duration > 0) ? entry.duration : 0);
				continue;
			}
			if (entry.scheduled) {
				let subsetSumEntry: Entry | undefined = undefined;

				// If this is the first entry, or the previous entry is not of type subset-sub,
				// We need to insert one.
				if (i == 0 || this.getQueueTypeFromEntry(queue.entries[i - 1])?.scheduleStrategy !== "subset-sum") {
					if (entry.scheduled > start) {
						subsetSumEntry = this.createSubsetSumEntry(start, 0);
						queue.entries.splice(i, 0, subsetSumEntry);
						i++;
					}
				} else {
					// TODO: entry with queueRef BUG
					subsetSumEntry = queue.entries[i - 1];
				}
				if (subsetSumEntry) {
					if (!subsetSumEntry.duration) {
						subsetSumEntry.duration = 0;
					}
					let diff = entry.scheduled.getTime() - (offset + durationSum);
					if (diff < 0) {
						if (subsetSumEntry.duration && subsetSumEntry.duration >= -diff) {
							subsetSumEntry.duration = subsetSumEntry.duration + diff;
							durationSum = durationSum + diff;
						} else {
							console.error("Unable to fit schedule", entry);
							if (subsetSumEntry.duration) {
								durationSum = durationSum - subsetSumEntry.duration;
								subsetSumEntry.duration = 0;
							}
						}
					} else if (diff > 0) {
						subsetSumEntry.duration = subsetSumEntry.duration + diff;
						durationSum = durationSum + diff;
					}
					if (subsetSumEntry.queueRef) {
						this.queues[subsetSumEntry.queueRef].duration = subsetSumEntry.duration;
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
		
		// TODO: recalc all referencing queues without circle

		let mainQueue = this.getQueueByType("Main Queue");
		if (queue === mainQueue) {
			this.databaseService.saveQueues();
		} else if (save && mainQueue) {
			this.recalculateQueue(mainQueue);
		}
	}

	private getIndexByOffset(queue: Queue, offset: Date) {
		for (let i = 0; i < queue.entries.length; i++) {
			let entry = queue.entries[i];
			if (entry.offset && entry.offset >= offset) {
				return i;
			}
		}
		return queue.entries.length;
	}

	private createRefEntryForQueue(queue: Queue, offset: Date) {
		return new Entry(queue.name, undefined, offset, queue.duration, this.queueTypes[queue.type].color, queue.uuid);
	}

	private enqueue(queue: Queue, targetOffset: Date, schedule: boolean) {
		let mainQueue = this.getQueueByType("Main Queue")!;
		this.deleteSubqueueReferenceFromQueue(mainQueue, queue);
		this.recalculateQueue(mainQueue, false);
		let index = this.getIndexByOffset(mainQueue, targetOffset);
		let offset = mainQueue.offset || DateTimeUtil.now();
		if (index > 0) {
			let previousEntry = mainQueue.entries[index - 1];
			if (previousEntry.offset) {
				offset = new Date(previousEntry.offset.getTime() + previousEntry.duration!);
				// TODO: if previousEntry is subset-sum, clear future sub-entries.
			} 
		}
		if (schedule) {
			offset = targetOffset;
		}
		let entry = this.createRefEntryForQueue(queue, offset);
		if (schedule) {
			entry.scheduled = targetOffset;
			queue.offset = targetOffset;
			this.recalculateQueue(queue);
		}
		mainQueue.entries.splice(index, 0, entry);
		this.recalculateQueue(mainQueue);
		return entry;
	}

	enqueueNext(queue: Queue) {
		this.enqueue(queue, DateTimeUtil.now(), false);
	}

	schedule(queue: Queue, date: Date) {
		console.log("ScheduleDialog closed", queue, date);
		// TODO: Replace "unscheduled" in queue name
		queue.name = queue.type + " " + this.formatter.format(date); 
		this.enqueue(queue, date, true);
	}

	addToHistory(entry: Entry) {
		let queue = this.getQueueByType("History");
		if (!queue) {
			return;
		}
	    let historyEntry = new Entry(entry.name, undefined, new Date(), entry.duration, entry.color);
		queue.entries.push(historyEntry);
		this.databaseService.saveQueues();
	}

	getEntryByTime(queue: Queue, date: Date): Entry|undefined {
		if (!queue?.entries?.length) {
			return undefined;
		}
		let lastEntry: Entry|undefined = undefined
		for (let entry of queue.entries) {
			if (entry.offset && entry.duration && entry.duration > 0 && entry.offset > date) {
				return lastEntry;
			}
			lastEntry = entry;
		}
		return lastEntry;
	}

	deleteEntryFromQueueByIndex(queue: Queue|undefined, index: number) {
		if (!queue || index < 0 || !queue.entries?.length || index >= queue.entries.length) {
			return;
		}

		queue.entries.splice(index, 1);
		this.recalculateQueue(queue);
	}

	deleteSubqueueReferenceFromQueue(queue?: Queue, subQueue?: Queue) {
		if (!queue || !queue.entries?.length || !subQueue) {
			return;
		}
		let uuid = subQueue.uuid;
		for (let i = queue.entries.length - 1; i >= 0; i--) {
			if (queue.entries[i].queueRef === uuid) {
				this.deleteEntryFromQueueByIndex(queue, i);
			}
		}
	}
}
