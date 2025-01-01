import { TestBed } from '@angular/core/testing';

import { PlayService } from './play.service';
import { Entry } from '../model/entry';
import { QueueService } from './queue.service';
import { DatabaseTestUtil } from './database.testutil';
import { DateTimeUtil } from '../util/date-time-util';
import { Queue } from '../model/queue';

describe('PlayService (logic)', () => {
	let queueService: QueueService;
	let playService: PlayService;
	let mainQueue: Queue;

	beforeEach(() => {
		TestBed.configureTestingModule({

		});
		queueService = TestBed.inject(QueueService);
		queueService.queues = structuredClone(DatabaseTestUtil.queues);
		queueService.queueTypes = structuredClone(DatabaseTestUtil.queueTypes);
		queueService.files = structuredClone(DatabaseTestUtil.files);

		playService = TestBed.inject(PlayService);
		playService.queues = queueService.queues;

		mainQueue = queueService.getQueueByType("Main Queue")!;
	});

	it('should pick start', () => {
		DateTimeUtil.fakeNow = new Date("3025-01-01T00:00:01.383Z");
		playService.current = [];
		playService.logic();
		let current = playService.current;
		expect(current).toEqual([
			{ "color": "#0A0", "name": "News 01:00", "offset": new Date("3025-01-01T00:00:00.383Z"), "duration": 27216, "queueRef": "m5cxtb0g-b3709016-1dce-4bc7-b279-7edb79049bb6", "scheduled": new Date("3025-01-01T00:00:00.383Z") },
			{ "color": "#0A0", "name": "news/Heat! Our count.mp3", "offset": new Date("3025-01-01T00:00:03.743Z"), "duration": 13560 }
		]);
	});

	fit('should pick next in same queue', () => {
		DateTimeUtil.fakeNow = new Date("3025-01-01T00:00:01.383Z");
		playService.current = [mainQueue.entries[0], queueService.resolveQueue(mainQueue.entries[0]).entries[1]];
		playService.logic();
		let current = playService.current;
		expect(current).toEqual([
			{ "color": "#0A0", "name": "News 01:00", "offset": new Date("3025-01-01T00:00:00.383Z"), "duration": 27216, "queueRef": "m5cxtb0g-b3709016-1dce-4bc7-b279-7edb79049bb6", "scheduled": new Date("3025-01-01T00:00:00.383Z") },
			{ "color": "#0A0", "name": "news/It will be sunn.mp3", "offset": new Date("3025-01-01T00:00:17.303Z"), "duration": 8328 }
		]);
	});


});

