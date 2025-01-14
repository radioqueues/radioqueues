import { AfterViewInit, Component, ElementRef, Input, ViewChild, inject } from '@angular/core';

import { FileSystemService } from 'src/app/service/filesystem.service';
import { DatabaseService } from 'src/app/service/database.service';
import { Queue } from 'src/app/model/queue';
import { QueueService } from 'src/app/service/queue.service';
import { Entry } from 'src/app/model/entry';
import { DurationPipe } from 'src/app/pipe/duration.pipe';
import { TitlePipe } from 'src/app/pipe/title.pipe';
import { FormsModule } from '@angular/forms';
import { AudioFileService } from 'src/app/service/audio-file.service';
import { ErrorService } from 'src/app/service/error.service';
import { PlayService } from 'src/app/service/play.service';
import { QueuePath } from 'src/app/model/queue-path';
import { ProgressStatusService } from 'src/app/service/progress-status.service';

@Component({
	selector: 'app-audio-control',
	templateUrl: './audio-control.component.html',
	imports: [DurationPipe, FormsModule, TitlePipe],
	standalone: true
})
export class AudioControlComponent {

	audioFileService = inject(AudioFileService);
	databaseService = inject(DatabaseService);
	errorService = inject(ErrorService);
	fileSystemService = inject(FileSystemService);
	playService = inject(PlayService);
	progressStatusService = inject(ProgressStatusService);
	queueService = inject(QueueService);

	@Input() queues!: Record<string, Queue>;
	@ViewChild("audio") audio!: ElementRef<HTMLAudioElement>;
	playing = false;
	mainQueue!: Queue;

	remainingTime?: number;
	url?: string;

	volumne = 0.8;
	current?: QueuePath;

	async onPlayClicked() {
		this.playing = true;
		this.play();
	}

	onSelectClicked() {
		if (this.current?.length) {
			this.queueService.resolveQueue(this.current[0]).visible = true;
			if (this.current.length > 0) {
				// TODO
			}
		}
	}

	async play() {
		await this.playService.logic();
		this.current = this.playService.current!;
		if (this.playService.empty(this.current)) {
			this.errorService.errorDialog("No entry to play");
			return;
		}
		if (this.current.length === 1) {
			this.url = undefined;
			setTimeout(() => {this.onEnded()}, this.current[0].duration);
			return;
		}
		let currentEntry: Entry = this.current[this.current.length - 1];
		try {
			this.audioFileService.markFileAsPlayed(currentEntry.name!);
			this.queueService.addToHistory(currentEntry);
			let fileHandle = await this.fileSystemService.getFileHandle(currentEntry.name!);
			let blob = await fileHandle?.getFile();
			if (blob) {
				this.url = URL.createObjectURL(blob);
			}
		} catch (e) {
			console.error(e);
			this.onEnded();
		}
	}

	async onEnded() {
		this.play();
	}

	onError() {
		if (this.url) {
			this.onEnded();
		}
	}

	onTimeUpdate() {
		let currentEntry: Entry = this.current![this.current!.length - 1]!;
		let duration = currentEntry?.duration;
		let currentTime = this.audio?.nativeElement?.currentTime * 1000;
		if (!duration || !currentTime) {
			console.log(duration, currentTime);
			this.remainingTime = duration;
		} else {
			this.remainingTime = duration - currentTime;
		}
	}
}