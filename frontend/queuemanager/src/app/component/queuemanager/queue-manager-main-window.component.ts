import { Component } from '@angular/core';
import {
	CdkDragDrop,
	CdkDrag,
	CdkDropList,
	CdkDropListGroup,
	moveItemInArray,
	transferArrayItem,
} from '@angular/cdk/drag-drop';

import { Entry } from '../../model/entry';

@Component({
	selector: 'app-queue-manager-main-window',
	templateUrl: './queue-manager-main-window.component.html',
	styleUrl: './queue-manager-main-window.component.css',
	standalone: true,
	imports: [CdkDropListGroup, CdkDropList, CdkDrag],
})
export class QueueManagerMainWindowComponent {
	todo: Entry[] = [
		{
			name: 'Get to work'
		},
		{
			name: 'Pick up groceries'
			},
		{
			name: 'Go home'
		},
		{
			name: 'Fall asleep'
		}
	];

	done: Entry[] = [
		{
			name: 'Get up'
		},
		{
			name: 'Brush teeth'
			},
		{
			name: 'Take a shower'
		},
		{
			name: 'Check e-mail'
		},
		{
			name: 'Walk dog'
		}
	];

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