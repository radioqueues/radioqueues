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

	@Input({required: true}) queue!: Queue;
	@Input() readonly?: boolean;
	@Input() showSubQueueContent: boolean = true;
	selectedIndex = -1;

	@HostListener('window:mousedown')
	onGlobalClick() {
		this.selectedIndex = -1;
	}

	onClick(event: MouseEvent) {
		let entryElement = (event.target as HTMLElement).closest(".queue-entry");
		if (!entryElement) {
			return;
		}
		this.selectedIndex = Array.from(entryElement.parentElement!.children).indexOf(entryElement);
	}

	drop(event: CdkDragDrop<Entry[]>) {
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

	onKeydown($event: KeyboardEvent) {
		if ($event.key === "Delete") {
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

	formatOffset(offset?: Date|string) {
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