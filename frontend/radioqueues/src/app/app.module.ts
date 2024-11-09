import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AudioFileService } from './service/audio-file.service';
import { DatabaseService } from './service/database.service';
import { DynamicQueueService } from './service/dynamic-queue.service';
import { ErrorService } from './service/error.service';
import { FileSystemService } from './service/filesystem.service';
import { IndexeddbCacheService } from './service/indexeddb-cache.service';
import { QueueService } from './service/queue.service';
import { ProgressStatusService } from './service/progress-status.service';
import { PlayService } from './service/play.service';

@NgModule({
	providers: [
		AudioFileService,
		DatabaseService,
		DynamicQueueService,
		ErrorService,
		FileSystemService,
		IndexeddbCacheService,
		PlayService,
		ProgressStatusService,
		QueueService
	],
	exports: [
		RouterModule
	],
})
export class AppModule { }
