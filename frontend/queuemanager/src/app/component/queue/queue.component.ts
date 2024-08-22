import { Component, Input } from '@angular/core';
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

	drop(event: CdkDragDrop<Entry[]>) {
		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		} else {
			transferArrayItem(
				event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex,
			);
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
}