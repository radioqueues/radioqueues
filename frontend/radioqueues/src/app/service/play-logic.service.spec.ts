import { TestBed } from '@angular/core/testing';

import { PlayService } from './play.service';
import { QueueService } from './queue.service';
import { DatabaseTestUtil } from './database.testutil';
import { DateTimeUtil } from '../util/date-time-util';
import { Queue } from '../model/queue';
import { SECONDS } from '../model/time';
import { DynamicQueueService } from './dynamic-queue.service';
import { DatabaseService } from './database.service';
import { FileSystemService } from './filesystem.service';

describe('PlayService (logic)', () => {
	let queueService: QueueService;
	let playService: PlayService;
	let mainQueue: Queue;

	beforeEach(() => {
		let dynamicQueueServiceSpy = jasmine.createSpyObj('DynamicQueueService', ['scheduleQueue']);
		let fileSystemServiceSpy = jasmine.createSpyObj('FileSystemService', ['init', 'saveJsonToFilename']);
		TestBed.configureTestingModule({
			providers: [
				{provide: DynamicQueueService, useValue: dynamicQueueServiceSpy},
				{provide: FileSystemService, useValue: fileSystemServiceSpy},
			]
		});

		queueService = TestBed.inject(QueueService);
		queueService.queues = structuredClone(DatabaseTestUtil.queues);
		queueService.queueTypes = structuredClone(DatabaseTestUtil.queueTypes);
		queueService.files = structuredClone(DatabaseTestUtil.files);

		let databaseService = TestBed.inject(DatabaseService);
		databaseService.initTest(queueService.queues, queueService.queueTypes, queueService.files);

		playService = TestBed.inject(PlayService);
		playService.queues = queueService.queues;

		mainQueue = queueService.getQueueByType("Main Queue")!;

		// make the subset-sum queue just a bit too short, in order to test recalculation of the following queues
		dynamicQueueServiceSpy.scheduleQueue.and.callFake((queueTypeName: string, duration: number) => {
			let queueType = DatabaseTestUtil.queueTypes[queueTypeName];
			let shorterDuration = duration - 10 * SECONDS;
			let filename = queueType.folder! + "/file_" + (shorterDuration / SECONDS) + ".mp3";
			queueService.files[filename] = { duration: shorterDuration };
			return [filename];
		});

	});

	it('should pick start', async () => {
		DateTimeUtil.fakeNow = new Date("3025-01-01T00:00:01.383Z");
		playService.current = [];
		await playService.logic();
		let current = playService.current;
		expect(current).toEqual([
			{ "color": "#0A0", "name": "News 01:00", "offset": new Date("3025-01-01T00:00:00.383Z"), "duration": 27216, "queueRef": "m5cxtb0g-b3709016-1dce-4bc7-b279-7edb79049bb6", "scheduled": new Date("3025-01-01T00:00:00.383Z") },
			{ "color": "#0A0", "name": "news/Heat! Our count.mp3", "offset": new Date("3025-01-01T00:00:03.743Z"), "duration": 13560 }
		]);
	});

	it('should pick next in same queue', async () => {
		DateTimeUtil.fakeNow = new Date("3025-01-01T00:00:01.383Z");
		playService.current = [mainQueue.entries[0], queueService.resolveQueue(mainQueue.entries[0]).entries[1]];
		await playService.logic();
		let current = playService.current;
		expect(current).toEqual([
			{ "color": "#0A0", "name": "News 01:00", "offset": new Date("3025-01-01T00:00:00.383Z"), "duration": 27216, "queueRef": "m5cxtb0g-b3709016-1dce-4bc7-b279-7edb79049bb6", "scheduled": new Date("3025-01-01T00:00:00.383Z") },
			{ "color": "#0A0", "name": "news/It will be sunn.mp3", "offset": new Date("3025-01-01T00:00:17.303Z"), "duration": 8328 }
		]);
	});

	it('should fill subset-sum queue', async () => {
		DateTimeUtil.fakeNow = new Date("3025-01-01T00:00:26.123Z");
		playService.current = [mainQueue.entries[0], queueService.resolveQueue(mainQueue.entries[0]).entries[3]];

		await playService.logic();
		let current = playService.current;
		console.log(queueService.queues, queueService.files, current);
		expect(current.length).toBe(2);
		expect(current[0].offset?.toString()).toBe(new Date("3025-01-01T00:00:26.123Z").toString());

		let next = playService.pickNextQueue(current);
		expect(next?.offset?.toString()).toEqual(new Date("3025-01-01T00:14:52.123Z").toString());
	});

	it('should play the next queue after subset-sum queue', async () => {
		DateTimeUtil.fakeNow = new Date("3025-01-01T00:00:26.123Z");
		playService.current = [mainQueue.entries[0], queueService.resolveQueue(mainQueue.entries[0]).entries[3]];

		await playService.logic();
		let current = playService.current;
		DateTimeUtil.fakeNow = new Date("3025-01-01T00:14:52.123Z");

		await playService.logic();
		current = playService.current
		console.log(queueService.queues, queueService.files, current);
		expect(current.length).toBe(2);
		expect(current[0]).toBe(mainQueue.entries[2]);
	});

});

