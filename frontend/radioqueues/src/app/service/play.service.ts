import { Injectable, inject } from "@angular/core";
import { Entry } from "../model/entry";
import { DatabaseService } from "./database.service";
import { ErrorService } from "./error.service";
import { QueueService } from "./queue.service";
import { Queue } from "../model/queue";
import { QueuePath } from "../model/queue-path";
import { MINUTES } from "../model/time";
import { DateTimeUtil } from "../util/date-time-util";

@Injectable({
	providedIn: 'root'
})
export class PlayService {

	databaseService = inject(DatabaseService);
	errorService = inject(ErrorService);
	queueService = inject(QueueService);
	queues!: Record<string, Queue>;

	current: QueuePath | undefined;

	constructor() {
		this.init();
	}

	async init() {
		this.queues = await this.databaseService.getQueues();
	}

	pickByTime(date: Date): QueuePath | undefined {
		let queue = this.queueService.getQueueByType("Main Queue")!;
		if (!queue || !queue.entries?.length) {
			console.log("No Main Queue or Main Queue is empty");
			return undefined;
		}

		let entry: Entry | undefined;
		let path: QueuePath = [];
		while (queue) {
			entry = this.queueService.getEntryByTime(queue, date);
			if (!entry) {
				break;
			}
			path.push(entry);
			if (!entry?.queueRef) {
				return path;
			}
			queue = this.queues[entry.queueRef];
		}
		return path;
	}

	pickFirst(entry: Entry): Entry[] {
		let queue = this.queueService.resolveQueue(entry);
		let path: QueuePath = [];

		while (queue.entries && queue.entries.length > 0) {
			let e = queue.entries[0];
			path.push(e);
			if (e.queueRef) {
				queue = this.queues[e.queueRef];
			} else {
				return path;
			}
		}
		return path;
	}

	isQueue(path?: QueuePath): boolean {
		if (!path?.length) {
			return false;
		}
		let lastElement = path[path.length - 1];
		return !!(lastElement as Queue).entries || lastElement.queueRef;
	}

	isEntry(path?: QueuePath): boolean {
		if (!path?.length) {
			return false;
		}
		let lastElement = path[path.length - 1];
		return !(lastElement as Queue).entries && !lastElement.queueRef;
	}

	pickNextEntryInSameQueue(path?: QueuePath): QueuePath | undefined {
		if (!path || !path.length) {
			return undefined;
		}
		let queue = this.queueService.resolveQueue(path[path.length - 1]);
		if (this.isQueue(path)) {
			let additionalPath = this.pickFirst(queue);
			return [...path.slice(0, path.length), ...additionalPath!];
		}

		if (path.length < 2) {
			console.log("QueuePath " + path + " has only one component and this component is not a queue");
			return undefined;
		}

		queue = this.queueService.resolveQueue(path[path.length - 2]);
		if (!queue?.entries?.length) {
			console.log("Queue at second but last component of QueuePath " + path + " has no entries");
			return undefined;
		}
		let idx = queue.entries.indexOf(path[path.length - 1]);
		if (idx < 0 || idx >= queue.entries.length - 1) {
			return undefined;
		}
		return [...path.slice(0, -1), queue.entries[idx + 1]];
	}

	pickNext(path?: QueuePath): QueuePath | undefined {

		// if path is empty, get the first entry from the main queue
		if (!path || !path.length) {
			let mainQueue = this.queueService.getQueueByType("Main Queue")!;
			return this.pickFirst(mainQueue);
		}

		// if the last entry is a queue, check for entries
		let additionalPath = this.pickFirst(path[path.length - 1]);
		if (additionalPath && additionalPath.length) {
			return [...path, ...additionalPath];
		}

		// advance the last entry
		//    if we are at the end of the last queue, advance the prevous queue
		// at the end make sure that the first entry from the current queue is picked
		for (let entryIndex = 1; entryIndex < path.length; entryIndex++) {
			let queueIndex = entryIndex + 1;

			let previousEntry = path[path.length - entryIndex];
			let queue = path[path.length - queueIndex] as Queue
			queue = this.queueService.resolveQueue(queue);

			let idx = queue.entries.indexOf(previousEntry);
			if (idx < 0) {
				return undefined;
			}
			if (queue.entries.length > idx + 1) {
				let additionalPath = this.pickFirst(queue.entries[idx + 1]);
				return [...path.slice(0, -1 * entryIndex), queue.entries[idx + 1], ...additionalPath!];
			}
		}
		return undefined;
	}

	pickNextQueue(path: QueuePath | undefined): Queue | undefined {
		if (this.empty(path)) {
			return undefined;
		}
		let mainQueue = this.queueService.getQueueByType("Main Queue")!;
		if (!mainQueue.entries) {
			return undefined;
		}

		let idx = mainQueue.entries.indexOf(path![0]);
		if (idx < 0 || (idx + 1) >= mainQueue.entries.length) {
			return undefined;
		}
		return mainQueue.entries![idx + 1] as Queue;
	}

	async handleEndOfMainQueue() {
		let entry = this.queueService.createSubsetSumEntry(DateTimeUtil.now(), 15 * MINUTES);
		let mainQueue = this.queueService.getQueueByType("Main Queue")!;
		if (!mainQueue.entries) {
			mainQueue.entries = [];
		}
		mainQueue.entries.push(entry);
		await this.queueService.fillQueue(entry);
		return entry;
	}

	empty(path?: QueuePath): boolean {
		return !path || !path.length;
	}


	async logic() {
		let mainQueue = this.queueService.getQueueByType("Main Queue")!;
		let path = this.current;
		let now = DateTimeUtil.now();

		// at program start, pick based on current time
		if (this.empty(path)) {
			path = this.pickByTime(now);
		}

		// TODO: handle case in which "now" before the first entry
		// end of main queue?
		if (this.empty(path)) {
			let queue = await this.handleEndOfMainQueue()
			await this.prepareCurrent([queue]);
			return;
		}

		// play next entry in same queue
		let tempPath = this.pickNextEntryInSameQueue(path);
		if (!this.empty(tempPath) && tempPath!.length > 1) {
			await this.prepareCurrent(tempPath);
			return;
		}

		// end of main queue?
		let nextQueue = this.pickNextQueue(path);
		if (!nextQueue) {

			// is the last queue an empty subset sum queue? Fill it.
			// TODO: test case in which the pre-existing subset-sum queue is already completely in the past
			if (path && this.queueService.isEmptySubsetSumQueue(path[0])) {
				await this.prepareCurrent([path[0]]);
				return;
			}

			let queue = await this.handleEndOfMainQueue();
			await this.prepareCurrent([queue]);
			return;
		}

		nextQueue.offset = now;

		// Is this queue scheduled?
		if (nextQueue.scheduled) {
			nextQueue.offset = nextQueue.scheduled;

			let diff = nextQueue.scheduled.getTime() - now.getTime();
			if (diff > 2 * MINUTES) {
				let queue = this.queueService.createSubsetSumEntry(now, diff);
				await this.queueService.fillQueue(queue);
				this.queueService.insertIntoQueue(mainQueue, queue);
				// TODO: recalculate main queue // use actual offset on next+1
				await this.prepareCurrent([queue]);
				return;
			}

			nextQueue.offset = now;
			// TODO: recalculate the main queue using the current time as offset to nextQueue
			this.queueService.recalculateQueue(mainQueue);
			await this.prepareCurrent([nextQueue]);
			return;
		}

		// is this an empty subset sum queue?
		if (this.queueService.isSubsetSumQueue(nextQueue) && !nextQueue.entries?.length) {
			let nextNextQueue = this.pickNextQueue([nextQueue]);
			if (!nextNextQueue) {
				await this.prepareCurrent([nextQueue]);
				return;
			}

			// is the next-next queue not scheduled?
			if (!nextNextQueue.scheduled) {
				this.queueService.deleteSubqueueReferenceFromQueue(mainQueue, nextQueue);
				this.queueService.recalculateQueue(mainQueue);
				// start the algorithm again // TODO: make it more effient by not starting from scratch
				return this.logic();
			}

			if (nextNextQueue.scheduled) {
				let duration = nextNextQueue.scheduled.getTime() - now.getTime();
				nextQueue.duration = duration;
				await this.prepareCurrent([nextQueue]);
				return;
			}
		}

		// Play the first song from nextQueue
		await this.prepareCurrent([nextQueue]);
	}

	private async prepareCurrent(path?: QueuePath) {
		if (!path || this.empty(path)) {
			this.current = undefined;
			return;
		}

		let now =  DateTimeUtil.now();
		let queueRef = path[0];
		let queue = this.queueService.resolveQueue(queueRef);

		if (this.isQueue(path)) {
			if (path.length === 1) {
				queueRef.offset = now
				queue.offset = now;
			}
		}

		if (this.queueService.isEmptySubsetSumQueue(queueRef)) {
			await this.queueService.fillQueue(queueRef);
			if (!queue.entries?.length) {
				this.current = [queueRef];
				return;
			}
			let mainQueue = this.queueService.getQueueByType("Main Queue")!;
			this.queueService.recalculateQueue(mainQueue);
		}

		if (this.isQueue(path)) {
			path = [...path, ...this.pickFirst(path[path.length - 1])];
		}

		let entry = path[path.length - 1];
		entry.offset = now;

		this.current = path;
	}
}