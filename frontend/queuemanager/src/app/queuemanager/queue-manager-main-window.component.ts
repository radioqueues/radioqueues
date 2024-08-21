import { Component } from '@angular/core';
import {
	CdkDragDrop,
	CdkDrag,
	CdkDropList,
	CdkDropListGroup,
	moveItemInArray,
	transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
	selector: 'app-queue-manager-main-window',
	templateUrl: './queue-manager-main-window.component.html',
	styleUrl: './queue-manager-main-window.component.css',
	standalone: true,
	imports: [CdkDropListGroup, CdkDropList, CdkDrag],
})
export class QueueManagerMainWindowComponent {
	todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];

	done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

	drop(event: CdkDragDrop<string[]>) {
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