import { Component, ElementRef, Input, OnInit, ViewChild, inject } from '@angular/core';

import { FileSystemService } from 'src/app/service/filesystem.service';
import { DatabaseService } from 'src/app/service/database.service';
import { Queue } from 'src/app/model/queue';
import { QueueService } from 'src/app/service/queue.service';
import { Entry } from 'src/app/model/entry';
import { DurationPipe } from 'src/app/pipe/duration.pipe';
import { TitlePipe } from 'src/app/pipe/title.pipe';

@Component({
	selector: 'app-audio-control',
	templateUrl: './audio-control.component.html',
	standalone: true,
	imports: [DurationPipe, TitlePipe],
})
export class AudioControlComponent {
	fileSystemService = inject(FileSystemService);
	databaseService = inject(DatabaseService);
	queueService = inject(QueueService);
	
	@Input() queues!: Record<string, Queue>;
	@ViewChild("audio") audio!: ElementRef<HTMLAudioElement>;
	mainQueue!: Queue;

	currentParentEntry?: Entry;
	currentEntry?: Entry;
    remainingTime?: number;
	url?: string;

	async onPlayClicked() {
		this.mainQueue = this.queueService.getQueueByType("Main Queue")!;
		if (this.mainQueue && this.mainQueue.entries) {
			this.currentParentEntry = this.mainQueue.entries[0];
			this.currentEntry = this.currentParentEntry;
			if (this.currentParentEntry.queueRef) {
				let subQueue = this.queues[this.currentParentEntry.queueRef];
				if (subQueue && subQueue.entries) {
					this.currentEntry = subQueue.entries[0];
				}
			}
		}
		this.remainingTime = this.currentEntry?.duration;
		if (!this.currentEntry?.name) {
			return;
		}
		let blob = await this.fileSystemService.getFile(this.currentEntry?.name);
		if (blob) {
			this.url = URL.createObjectURL(blob!);
		}
	}

	onTimeUpdate($event) {
		let duration = this.currentEntry?.duration;
		let currentTime = this.audio?.nativeElement?.currentTime;
		if (!duration || !currentTime) {
			console.log(duration, currentTime);
			this.remainingTime = duration;
		} else {
			this.remainingTime = duration - currentTime;		
		}
	}
}