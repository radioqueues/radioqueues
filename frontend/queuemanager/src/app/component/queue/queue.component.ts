import { Component, EventEmitter, HostListener, Input, OnInit, Output, inject } from '@angular/core';
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

@Component({
	selector: 'app-queue',
	templateUrl: './queue.component.html',
	styleUrl: './queue.component.css',
	standalone: true,
	imports: [CdkDropListGroup, CdkDropList, CdkDrag],
})
export class QueueComponent {
	fileSystemService = inject(FileSystemService);
	databaseService = inject(DatabaseService);
	
	@Input() queues!: Record<string, Queue>;
	@Output() queuesChange = new EventEmitter<Record<string, Queue>>();

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
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		} else {
			event.container.data.splice(event.currentIndex, 0, event.previousContainer.data[event.previousIndex]);
		}
	}

	createQueueEntry(queue: Queue, name: string) {
		return new Entry(name, "2024-01-01 00:00:00", 0, queue.color);
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
		console.log("File(s) dropped", event);
		let entryElement = (event.target as HTMLElement).closest(".queue-entry");
		entryElement?.classList?.remove("dragover");

		// Prevent default behavior (Prevent file from being opened)
		event.preventDefault();

		if (event.dataTransfer?.items) {
			console.log("items", event.dataTransfer.items);

			// Use DataTransferItemList interface to access the file(s)
			let newEntries: Array<Entry> = [];
			[...event.dataTransfer.items].forEach(async (item, i) => {
				// If dropped items aren't files, reject them
				console.log("item", item, JSON.stringify(item));
				if (item.kind === "file") {
					const file = item.getAsFile();
					if (file) {
						console.log(`… file[${i}].name = ${file?.name}`, file);
						newEntries.push(this.createQueueEntry(this.queue, file?.name));
					}
				}
				// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle
				if ((item as any).getAsFileSystemHandle) {
					let fileSystemHandle = await (item as any).getAsFileSystemHandle();
					let path = await this.fileSystemService.rootHandle?.resolve(fileSystemHandle);
					console.log(path);
				}
			});
			if (newEntries) {
				let index = this.getIndexFromElement(event.target)
				this.queue.entries.splice(index, 0, ...newEntries);
			}
		}

	}

	onDragOver(event) {
		console.log("File(s) in drop zone");
		// Prevent default behavior (Prevent file from being opened)
		event.preventDefault();
	}

	onKeydown(event: KeyboardEvent) {
		if (event.key === "Delete") {
			if (this.selectedIndex > -1) {
				this.queue.entries.splice(this.selectedIndex, 1);
				this.selectedIndex = -1;
			}
		}
	}

	pad2(num: number) {
		if (num < 10) {
			return "0" + num;
		}
		return "" + num;
	}

	formatOffset(offset?: Date | string) {
		if (!offset) {
			return "??:??:??";
		}
		return offset.toString().substring(11);
	}

	formatDuration(duration?: number) {
		if (!duration) {
			return "??:??";
		}
		let minutes = Math.floor(duration / 1000 / 60);
		let seconds = Math.floor(duration / 1000 % 60);
		return this.pad2(minutes) + ":" + this.pad2(seconds);
	}

	formatTitle(title?: string) {
		if (!title) {
			return "";
		}
		let lower = title.toLowerCase();
		if (lower.endsWith(".wav") || lower.endsWith(".mp3")) {
			title = title.substring(0, title.length - 4);
		}
		let pos = title.lastIndexOf("/");
		if (pos > -1) {
			title = title.substring(pos + 1);
		}
		return title;
	}
}