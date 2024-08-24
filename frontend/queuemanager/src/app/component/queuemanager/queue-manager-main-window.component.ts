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
import { QueueComponent } from '../queue/queue.component';
import { MockData } from 'src/app/service/queue.mock';

@Component({
	selector: 'app-queue-manager-main-window',
	templateUrl: './queue-manager-main-window.component.html',
	styleUrl: './queue-manager-main-window.component.css',
	standalone: true,
	imports: [CdkDropListGroup, CdkDropList, CdkDrag, QueueComponent],
})
export class QueueManagerMainWindowComponent {

	queues = MockData.queues;
	
	constructor() {
/*		this.queues[1][0].entries.push(this.queues[2][0]);
		this.queues[1][0].entries.push({ "name": "Musik", "offset": "2024-08-16 10:03:20", duration: (11*60+40)*1000, color: "#AAA" });
*/		this.queues[1][0].entries.push(this.queues[3][0]);
		this.queues[1][0].entries.push({ "name": "Musik", "offset": "2024-08-16 10:16:22", duration: (28*60+38)*1000, color: "#AAA" });
		this.queues[1][0].entries.push(this.queues[3][1]);
		this.queues[1][0].entries.push({ "name": "Musik", "offset": "2024-08-16 10:46:34", duration: (13*60+26)*1000, color: "#AAA" });
		this.queues[1][0].entries.push(this.queues[2][1]);
		this.queues[1][0].entries.push({ "name": "Musik", "offset": "2024-08-16 11:04:08", duration: (10*60+52)*1000, color: "#AAA" });
		this.queues[1][0].entries.push(this.queues[3][2]);
		this.queues[1][0].entries.push({ "name": "Musik", "offset": "2024-08-16 11:17:03", duration: (12*60+57)*1000, color: "#AAA" });
		this.queues[1][0].entries.push(this.queues[2][2]);
		this.queues[1][0].entries.push({ "name": "Musik", "offset": "2024-08-16 11:31:40", duration: (13*60+20)*1000, color: "#AAA" });
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