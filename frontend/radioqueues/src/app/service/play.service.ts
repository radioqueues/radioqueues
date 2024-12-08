import { Injectable, inject } from "@angular/core";
import { Entry } from "../model/entry";
import { DatabaseService } from "./database.service";
import { ErrorService } from "./error.service";
import { QueueService } from "./queue.service";
import { Queue } from "../model/queue";
import { QueuePath } from "../model/queue-path";

@Injectable({
	providedIn: 'root'
})
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

	pickByTime(date: Date): QueuePath|undefined {
		let queue = this.queueService.getQueueByType("Main Queue")!;
		if (!queue || !queue.entries?.length) {
			this.errorService.errorDialog("No Main Queue or Main Queue is empty");
			return undefined;
		}
		
		let entry: Entry|undefined;
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
			if (e.queueRef) {
				queue = this.queues[e.queueRef];
				path.push(queue);
			} else {
				path.push(e);
				return path;
			}
		}
		return path;
	}

	pickNext(path?: QueuePath): QueuePath|undefined {

		// if path is empty, return undefined
		if (!path || !path.length) {
			return undefined;
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
	
			let idx = queue.entries.indexOf(previousEntry);
			if (idx < 0) {
				return undefined;
			}
			if (queue.entries.length > idx + 1) {
				let additionalPath = this.pickFirst(queue.entries[idx + 1]);
				return [...path.slice(0, -1 * entryIndex), queue.entries[idx + 1], ...additionalPath];
			}
		}
	    return undefined;
	}
}