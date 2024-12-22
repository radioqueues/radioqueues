import { TestBed } from '@angular/core/testing';

import { DynamicQueueService } from './dynamic-queue.service';
import { DynamicQueueTestdata } from './dynamic-queue.testdata';
import { MINUTES, SECONDS } from '../model/time';

fdescribe('DynamicQueueService', () => {
	let service: DynamicQueueService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
			]
		});
		service = TestBed.inject(DynamicQueueService);
	});

	it('should work', () => {
		let files = DynamicQueueTestdata.files;
		console.log(files);
		let items = service.createMusicFileListFromFolder(files, "MyMusik");
		console.log("all items", items);
		let filtered = service.getFilesNotRecentlyPlayed(items, 50);
		console.log("filtered", filtered);
		console.time("pickMusicSubset");
		let result = service.pickMusicSubset(filtered, 120 * MINUTES + 30 * SECONDS, 10 * SECONDS)
		console.timeEnd("pickMusicSubset");
		console.log("result", result, result.totalDuration / MINUTES);

		// ensure that the test runs through, triggering the timeout handling
		expect(true).toBeTruthy();
	});
});
