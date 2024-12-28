import { TestBed } from '@angular/core/testing';

import { PlayService } from './play.service';
import { Entry } from '../model/entry';
import { Queue } from '../model/queue';
import { QueueService } from './queue.service';

describe('PlayService', () => {
	let service: PlayService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(PlayService);
		let queueService = TestBed.inject(QueueService);
		queueService.queues = {
			"Main Queue": new Queue("Main Queue")
		};
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should pick next', () => {
		expect(service.pickNext(undefined)).toEqual([]);
		expect(service.pickNext([new Entry()])).toBeUndefined();

		let queue1 = new Queue("Queue 1");
		let entry11 = new Entry("Queue 1 First Entry");
		let entry12 = new Entry("Queue 1 Second Entry");
		expect(service.pickNext([queue1])).toBeUndefined();
		queue1.entries = [entry11, entry12];
		expect(service.pickNext([queue1])).toEqual([queue1, entry11]);
		expect(service.pickNext([queue1, entry11])).toEqual([queue1, entry12]);
		expect(service.pickNext([queue1, entry12])).toBeUndefined();

		let queue2 = new Queue("Queue 2");
		let entry21 = new Entry("Queue 2 First Entry");
		let entry22 = new Entry("Queue 2 Second Entry");
		queue2.entries = [entry21, entry22];

		let queueMain = new Queue("Main Queue");
		queueMain.entries = [queue1, queue2];

		expect(service.pickNext([queueMain, queue1])).toEqual([queueMain, queue1, entry11]);
		expect(service.pickNext([queueMain, queue1, entry11])).toEqual([queueMain, queue1, entry12]);
		expect(service.pickNext([queueMain, queue1, entry12])).toEqual([queueMain, queue2, entry21]);
		expect(service.pickNext([queueMain, queue2, entry21])).toEqual([queueMain, queue2, entry22]);
		expect(service.pickNext([queueMain, queue2, entry22])).toBeUndefined();

	})

	it('should pick next in same queue', () => {
		expect(service.pickNextEntryInSameQueue(undefined)).toBeUndefined();
		expect(service.pickNextEntryInSameQueue([new Entry()])).toBeUndefined();

		let queue1 = new Queue("Queue 1");
		let entry11 = new Entry("Queue 1 First Entry");
		let entry12 = new Entry("Queue 1 Second Entry");
		expect(service.pickNextEntryInSameQueue([queue1])).toBeUndefined();
		queue1.entries = [entry11, entry12];
		expect(service.pickNextEntryInSameQueue([queue1])).toEqual([queue1, entry11]);
		expect(service.pickNextEntryInSameQueue([queue1, entry11])).toEqual([queue1, entry12]);
		expect(service.pickNextEntryInSameQueue([queue1, entry12])).toBeUndefined();

		let queue2 = new Queue("Queue 2");
		let entry21 = new Entry("Queue 2 First Entry");
		let entry22 = new Entry("Queue 2 Second Entry");
		queue2.entries = [entry21, entry22];

		let queueParent = new Queue("P Queue");
		queueParent.entries = [queue1, queue2];

		expect(service.pickNextEntryInSameQueue([queueParent, queue1])).toEqual([queueParent, queue1, entry11]);
		expect(service.pickNextEntryInSameQueue([queueParent, queue1, entry11])).toEqual([queueParent, queue1, entry12]);
		expect(service.pickNextEntryInSameQueue([queueParent, queue1, entry12])).toBeUndefined();
		expect(service.pickNextEntryInSameQueue([queueParent, queue2, entry21])).toEqual([queueParent, queue2, entry22]);
		expect(service.pickNextEntryInSameQueue([queueParent, queue2, entry22])).toBeUndefined();

	})
});
