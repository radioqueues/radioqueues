import { Injectable, inject } from "@angular/core";
import { Entry } from "../model/entry";
import { DatabaseService } from "./database.service";
import { ErrorService } from "./error.service";
import { QueueService } from "./queue.service";
import { Queue } from "../model/queue";
import { QueuePath } from "../model/queue-path";
import { MINUTES } from "../model/time";

@Injectable({
	providedIn: 'root'
})
export class PlayService {

	databaseService = inject(DatabaseService);
	errorService = inject(ErrorService);
	queueService = inject(QueueService);
	queues!: Record<string, Queue>;

	private current: QueuePath | undefined;

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
		let queue = entry as Queue;
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

	handleEndOfMainQueue() {
		let entry = this.queueService.createSubsetSumEntry(new Date(), 15 * MINUTES);
		let mainQueue = this.queueService.getQueueByType("Main Queue")!;
		if (!mainQueue.entries) {
			mainQueue.entries = [];
		}
		mainQueue.entries.push(entry);
		// TODO: fill subset-sum queue
		return entry;
	}

	empty(path?: QueuePath): boolean {
		return !path || !path.length;
	}


	logic() {
		let path = this.current;
		let now = new Date();

		// at program start, pick based on current time
		if (this.empty(path)) {
			path = this.pickByTime(new Date());
		}

		// end of main queue?
		if (this.empty(path)) {
			let queue = this.handleEndOfMainQueue()
			path = [queue, ...this.pickFirst(queue)];
			this.current = path;
			return;
		}

		// play next entry in same queue
		path = this.pickNextEntryInSameQueue(this.current);
		if (!this.empty(path)) {
			this.current = path;
			return;
		}

		// end of main queue?
		let nextQueue = this.pickNextQueue(path);
		if (!nextQueue) {
			let queue = this.handleEndOfMainQueue();
			path = [queue, ...this.pickFirst(queue)];
			this.current = path;
			return;
		}

		nextQueue.offset = now;

		// Is this queue scheduled?
		if (nextQueue.scheduled) {

			
			let diff = nextQueue.scheduled.getTime() - now.getTime();
			if (diff > 2 * MINUTES) {
				let queue = this.queueService.createSubsetSumEntry(now, diff);
				// TODO: insert queue into main queue at the correct position
				// TODO: fill subset-sum queue
				// TODO: recalculate main queue // use actual offset on next+1
				path = [queue, ...this.pickFirst(queue)];
				this.current = path;
				return;
			}

			// TODO: set offset of nextQueue to now
			// TODO: recalculate the main queue using the current time as offset to nextQueue
			path = [nextQueue, ...this.pickFirst(nextQueue)];
			this.current = path;
			return;
		}

		// is this an empty subset sum queue?
		if (this.queueService.isSubsetSumQueue(nextQueue) && !nextQueue.entries?.length) {
			let nextNextQueue = this.pickNextQueue([nextQueue]);
			if (!nextNextQueue) {
				// TODO: fill subset-sum queue
				path = [nextQueue, ...this.pickFirst(nextQueue)];
				this.current = path;
				return;
			}
			
			// is the next-next queue not scheduled?
			if (!nextNextQueue.scheduled) {
				// TODO: remove this subset sum queue
				// TODO: recalculate the main queue
				// TODO: start this algorithm again
			}

			if (nextNextQueue.scheduled) {
				let duration = nextNextQueue.scheduled.getTime() - now.getTime();
                nextQueue.duration = duration;
				// TODO: fill subset-sum queue
				// TODO: recalculate main queue // use actual offset on next+1
                path = [nextQueue, ...this.pickFirst(nextQueue)];
				this.current = path;
				return;
			}
		}

		// Play the first song from nextQueue
		path = [nextQueue, ...this.pickFirst(nextQueue)];
		this.current = path;
	}


}