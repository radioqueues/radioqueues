import { Component, HostListener, Input } from '@angular/core';
import {
	CdkDragDrop,
	CdkDrag,
	CdkDropList,
	CdkDropListGroup,
	moveItemInArray,
	transferArrayItem,
} from '@angular/cdk/drag-drop';

import { Entry } from '../../model/entry';
import { Queue } from 'src/app/model/queue';

@Component({
	selector: 'app-queue',
	templateUrl: './queue.component.html',
	styleUrl: './queue.component.css',
	standalone: true,
	imports: [CdkDropListGroup, CdkDropList, CdkDrag],
})
export class QueueComponent {

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
		this.selectedIndex = this.getIndexFromElement(event.target);
	}

	onCdkDrop(event: CdkDragDrop<Entry[]>) {
		this.selectedIndex = -1;
		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		} else {
			/*
			transferArrayItem(
				event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex,
			);*/
			event.container.data.splice(event.currentIndex, 0, event.previousContainer.data[event.previousIndex]);
		}
	}

	/*
	async function* getFilesRecursively(entry) {
	  if (entry.kind === "file") {
		const file = await entry.getFile();
		if (file !== null) {
		  file.relativePath = getRelativePath(entry);
		  yield file;
		}
	  } else if (entry.kind === "directory") {
		for await (const handle of entry.values()) {
		  yield* getFilesRecursively(handle);
		}
	  }
	}
	for await (const fileHandle of getFilesRecursively(directoryHandle)) {
	  console.log(fileHandle);
	}*/

	createQueueEntry(queue: Queue, name: string) {
		return new Entry(name, "00:00:00", 0, queue.color);
	}

	onDrop(event) {
		console.log("File(s) dropped", event);

		// Prevent default behavior (Prevent file from being opened)
		event.preventDefault();

		if (event.dataTransfer.items) {
			console.log("items", event.dataTransfer.items);

			// Use DataTransferItemList interface to access the file(s)
			let newEntries: Array<Entry> = [];
			[...event.dataTransfer.items].forEach((item, i) => {
				// If dropped items aren't files, reject them
				console.log("item", item, JSON.stringify(item));
				if (item.kind === "file") {
					const file = item.getAsFile();
					console.log(`… file[${i}].name = ${file.name}`, file);
					newEntries.push(this.createQueueEntry(this.queue, file.name));
				}
				// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle
				if (item.getAsFileSystemHandle) {
					console.log(item.getAsFileSystemHandle());
				}
			});
			if (newEntries) {
				let index = this.getIndexFromElement(event.target)
				this.queue.entries.splice(index, 0, ...newEntries);
			}
		}

		console.log("files", event.dataTransfer.files);
		// Use DataTransfer interface to access the file(s)
		[...event.dataTransfer.files].forEach((file, i) => {
			console.log(`… file[${i}].name = ${file.name}`, file);
		});

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
		return title;
	}
}