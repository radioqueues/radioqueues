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
}