import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import {
	CdkDragDrop,
	CdkDrag,
	CdkDropList,
	CdkDropListGroup,
	moveItemInArray,
} from '@angular/cdk/drag-drop';

import { Entry } from '../../model/entry';
import { Queue } from 'src/app/model/queue';
import { FileSystemService } from 'src/app/service/filesystem.service';
import { DatabaseService } from 'src/app/service/database.service';
import { OffsetPipe } from 'src/app/pipe/offset.pipe';
import { TitlePipe } from 'src/app/pipe/title.pipe';
import { DurationPipe } from 'src/app/pipe/duration.pipe';
import { QueueService } from 'src/app/service/queue.service';
import { QueueType } from 'src/app/model/queue-type';
import { ErrorService } from 'src/app/service/error.service';
import { AudioFileService } from 'src/app/service/audio-file.service';

@Component({
	selector: 'app-queue',
	templateUrl: './queue.component.html',
	styleUrl: './queue.component.css',
	standalone: true,
	imports: [
		CdkDropListGroup, CdkDropList, CdkDrag,
		DurationPipe, OffsetPipe, TitlePipe
	],
})
export class QueueComponent {
	audioFileService = inject(AudioFileService);
	errorService = inject(ErrorService);
	fileSystemService = inject(FileSystemService);
	databaseService = inject(DatabaseService);
	queueService = inject(QueueService);

	@Input({ required: true }) queues!: Record<string, Queue>;
	@Input({ required: true }) queueTypes!: Record<string, QueueType>;
	@Output() queuesChange = new EventEmitter<Record<string, Queue>>();

	@Input() supportsSubQueues = false;
	@Input({ required: true }) queue!: Queue;
	@Input() readonly?: boolean;
	@Input() showSubQueueContent: boolean = true;
	selectedIndex = -1;

	@HostListener('window:mousedown')
	onGlobalClick() {
		this.selectedIndex = -1;
	}

	getIndexFromElement(element?: EventTarget | HTMLElement | null): number {
		if (!element) {
			return -1;
		}
		let entryElement = (element as HTMLElement).closest(".queue-entry");
		if (!entryElement) {
			return -1;
		}
		return Array.from(entryElement.parentElement!.children).indexOf(entryElement);
	}

	onClick(event: MouseEvent) {
		let index = this.getIndexFromElement(event.target);
		this.selectedIndex = index;
	}

	onDoubleClick(event: MouseEvent) {
		this.selectedIndex = -1;
		let index = this.getIndexFromElement(event.target);
		let queueRef = this.queue.entries[index].queueRef;
		if (queueRef) {
			let subQueue = this.queues[queueRef];
			if (subQueue) {
				subQueue.visible = true;
				this.queuesChange.emit(this.queues);
			}
		}
	}

	onCdkDrop(event: CdkDragDrop<Entry[]>) {
		this.selectedIndex = -1;
		if (event.previousContainer === event.container) {
			let entry = event.container.data[event.previousIndex] as Entry;
			if (entry.scheduled) {
				this.errorService.errorDialog("Cannot move scheduled queues to another position.");
				return;
			}
			if (entry.offset && entry.offset < new Date()) {
				this.errorService.errorDialog("Cannot move an entry from the past around.");
				return;
			}
			let movedToEntry = event.container.data[event.currentIndex] as Entry;
			if (movedToEntry.offset && movedToEntry.offset < new Date()) {
				this.errorService.errorDialog("Cannot move an entry into the past.");
				return;
			}
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		} else {
			let orgEntry = event.previousContainer.data[event.previousIndex];
			if (orgEntry.queueRef || (orgEntry as Queue).type) {
				this.errorService.errorDialog("Cannot copy a queue into another queue.");
				return;
			}
			let entry = this.queueService.cloneEntry(orgEntry);

			let movedToEntry = event.container.data[event.currentIndex] as Entry;
			if (movedToEntry && movedToEntry.offset && movedToEntry.offset < new Date()) {
				this.errorService.errorDialog("Cannot move an entry into the past.");
				return;
			}
			entry.color = this.queue.color;
			event.container.data.splice(event.currentIndex, 0, entry);
		}
		this.queueService.recalculateQueue(this.queue);
		this.queuesChange.emit(this.queues);
	}

	async createQueueEntry(queue: Queue, name: string) {
		let files = await this.databaseService.getFiles();
		let duration = files[name]?.duration;
		return new Entry(name, undefined, new Date("2024-01-01 00:00:00"), duration, queue.color);
	}

	onDragEnter(event: Event) {
		event.preventDefault();
		let entryElement = (event.target as HTMLElement).closest(".queue-entry");
		entryElement?.classList?.add("dragover");
	}

	onDragLeave(event: Event) {
		event.preventDefault();
		let entryElement = (event.target as HTMLElement).closest(".queue-entry");
		entryElement?.classList?.remove("dragover");
	}

	async onDrop(event: DragEvent) {
		let entryElement = (event.target as HTMLElement).closest(".queue-entry");
		entryElement?.classList?.remove("dragover");

		// Prevent default behavior (Prevent file from being opened)
		event.preventDefault();

		if (!event.dataTransfer?.items) {
			return;
		}

		let promisses: Array<Promise<FileSystemFileHandle>> = [];
		[...event.dataTransfer.items].forEach(async (item) => {
			if (item.kind !== "file") {
				this.errorService.errorDialog("The dropped item is not a file.");
				return undefined;
			}
			promisses.push((item as any).getAsFileSystemHandle());
		});

		let fileHandles = await Promise.all(promisses);
		let loadedFiles = {};
		for (let fileHandle of fileHandles) {
			let path = await this.fileSystemService.rootHandle?.resolve(fileHandle);
			if (!path) {
				this.errorService.errorDialog("Dropped files are not in the known project folder and cannot be accessed.");
				return;
			}
			let filename = path.join("/");
			let file = await fileHandle.getFile();
			loadedFiles[filename] = {
				size: file.size,
				lastModified: file.lastModified,
			}
		}
		await this.audioFileService.loadDurations(loadedFiles);
		let newEntries: Array<Entry> = [];
		for (let filename in loadedFiles) {
			newEntries.push(await this.createQueueEntry(this.queue, filename));
		}
		if (newEntries) {
			let index = this.getIndexFromElement(event.target)
			this.queue.entries.splice(index, 0, ...newEntries);
		}
		this.queueService.recalculateQueue(this.queue);
		this.queuesChange.emit(this.queues);
	}


	onDragOver(event: Event) {
		// Prevent default behavior (Prevent file from being opened)
		event.preventDefault();
	}

	onKeydown(event: KeyboardEvent) {
		if (event.key === "Delete" && this.selectedIndex > -1) {
			this.deleteEntry();
		}
	}

	private deleteEntry() {
		let entry = this.queue.entries[this.selectedIndex];
		if (entry.offset && entry.offset < new Date()) {
			this.errorService.errorDialog("Cannot delete an entry from the past.");
			return;
		}
		this.queueService.deleteEntryFromQueueByIndex(this.queue, this.selectedIndex);
		this.selectedIndex = -1;
		this.queuesChange.emit(this.queues);
	}
}