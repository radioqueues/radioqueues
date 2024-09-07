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

	mainQueueIndex = 0;
	subQueueIndex = 0;

	async onPlayClicked() {
		console.log("onPlayClicked", this.mainQueueIndex, this.subQueueIndex);
		this.play();
	}

	async play() {
		console.log("play", this.mainQueueIndex, this.subQueueIndex);
		this.mainQueue = this.queueService.getQueueByType("Main Queue")!;
		if (this.mainQueue && this.mainQueue.entries) {
			this.currentParentEntry = this.mainQueue.entries[this.mainQueueIndex];
			this.currentEntry = this.currentParentEntry;
			if (this.currentParentEntry.queueRef) {
				let subQueue = this.queues[this.currentParentEntry.queueRef];
				if (subQueue && subQueue.entries) {
					this.currentEntry = subQueue.entries[this.subQueueIndex];
				}
			}
		}
		this.remainingTime = this.currentEntry?.duration;
		if (!this.currentEntry?.name) {
			return;
		}
		let blob = await this.fileSystemService.getFile(this.currentEntry?.name);
		if (blob) {
			this.url = URL.createObjectURL(blob);
		}
	}

	onEnded() {
		this.subQueueIndex++;
		console.log("ended", this.mainQueueIndex, this.subQueueIndex);

		this.mainQueue = this.queueService.getQueueByType("Main Queue")!;
		if (this.mainQueue && this.mainQueue.entries) {
			while (this.mainQueueIndex < this.mainQueue.entries.length) {
				this.currentParentEntry = this.mainQueue.entries[this.mainQueueIndex];
				if (!this.currentParentEntry?.queueRef) {
					this.mainQueueIndex++;
					this.subQueueIndex = 0;
					continue;
				}
				let subQueue = this.queues[this.currentParentEntry.queueRef];
				if (!subQueue || !subQueue.entries || this.subQueueIndex >= subQueue.entries.length) {
					this.mainQueueIndex++;
					this.subQueueIndex = 0;
					continue;
				}
		 		this.play();
				break;
			}
		}
	}

	onError() {
		if (this.url) {
			this.onEnded();
		}
	}

	onTimeUpdate() {
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