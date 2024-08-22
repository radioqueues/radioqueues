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
import { Queue } from 'src/app/model/queue';
import { QueueComponent } from '../queue/queue.component';

@Component({
	selector: 'app-queue-manager-main-window',
	templateUrl: './queue-manager-main-window.component.html',
	styleUrl: './queue-manager-main-window.component.css',
	standalone: true,
	imports: [CdkDropListGroup, CdkDropList, CdkDrag, QueueComponent],
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

	queues: Queue[][] = [
		[
			{
				name: 'Main Queue',
				entries: this.todo
			}
		],
		[
			{
				name: 'History',
				entries: this.done
			}
		],
		[
			{
				name: 'Nachrichten 20:00',
				color: "#0A0",
				entries: this.done
			},
			{
				name: 'Nachrichten 21:00',
				color: "#0A0",
				entries: this.done
			}
		],
		[
			{
				name: 'Werbung 20:15',
				color: "#A0A",
				entries: this.done
			},
			{
				name: 'Werbung 21:45',
				color: "#A0A",
				entries: this.done
			}
		],
		[
			{
				name: 'Report 20:30',
				color: "#AA0",
				entries: this.done
			},
			{
				name: 'Eilmeldung',
				color: "#A00",
				entries: this.done
			},
			{
				name: 'Musikwunsch ??:??',
				color: "#00A",
				entries: this.done
			}
		]

	];
	
	constructor() {
		this.queues[0][0].entries.push(this.queues[2][0]);
		this.queues[0][0].entries.push(this.queues[3][0]);
	}

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