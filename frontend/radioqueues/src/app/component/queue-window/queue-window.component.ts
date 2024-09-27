import { Component, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { Queue } from 'src/app/model/queue';
import { QueueComponent } from '../queue/queue.component';
import { QueueService } from 'src/app/service/queue.service';
import { QueueType } from 'src/app/model/queue-type';
import { ScheduleDialogComponent } from '../schedule-dialog/schedule-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-queue-window',
	templateUrl: './queue-window.component.html',
	styleUrl: './queue-window.component.css',
	standalone: true,
	imports: [CommonModule, FormsModule, MatCheckboxModule, MatToolbarModule, MatButtonModule, MatIconModule, MatExpansionModule, QueueComponent],
})
export class QueueWindowComponent {

	private dialog = inject(MatDialog);
	private queueService = inject(QueueService);

	@Input({ required: true }) queues!: Record<string, Queue>;
	@Input({ required: true }) queueTypes!: Record<string, QueueType>;
	@Output() queuesChange = new EventEmitter<Record<string, Queue>>();

	@Input({ required: true }) queue!: Queue;
	@Input() readonly?: boolean;
	@Input() supportsSubQueues: boolean = false;
	showSubQueueContent: boolean = false;

	isResizing = false;
	isDragging = false;
	zIndex = 1;
	static highestZIndex = 2;
	position = { top: 100, left: 100 };  // Starting position
	size = { width: 500, height: 400 };  // Default size

	private lastMouseX = 0;
	private lastMouseY = 0;

	constructor() {
		this.bringToFront();		
	}

	// Handle mouse down to start dragging or resizing
	onMouseDown(event: MouseEvent) {
		this.bringToFront();
		this.lastMouseX = event.clientX;
		this.lastMouseY = event.clientY;

		if ((event.target as HTMLElement).classList.contains('resizer')) {
			this.isResizing = true;
		} else {
			this.isDragging = true;
		}
	}

	@HostListener('document:mousemove', ['$event'])
	onMouseMove(event: MouseEvent) {
		const dx = event.clientX - this.lastMouseX;
		const dy = event.clientY - this.lastMouseY;

		if (this.isDragging) {
			this.position.left += dx;
			this.position.top += dy;
		}
		if (this.isResizing) {
			this.size.width += dx;
			this.size.height += dy;
		}

		this.lastMouseX = event.clientX;
		this.lastMouseY = event.clientY;
	}

	@HostListener('document:mouseup')
	stopActions() {
		this.isDragging = false;
		this.isResizing = false;
	}

	bringToFront() {
		QueueWindowComponent.highestZIndex++;
		this.zIndex = QueueWindowComponent.highestZIndex;
	}

	onCloseClicked() {
		this.queue.visible = false;
		this.queuesChange.emit(this.queues);
	}

	onCloneClicked() {
		this.queueService.cloneQueue(this.queue);
	}

	onQueuesChange(queues: Record<string, Queue>) {
		this.queuesChange.emit(queues);
	}

	onScheduleClicked() {
		let dialogRef: MatDialogRef<ScheduleDialogComponent, "next" | Date> = this.dialog.open(ScheduleDialogComponent);
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				if (result === "next") {
					this.queueService.enqueueNext(this.queue);
				} else {
					this.queueService.schedule(this.queue, result);
				}
			}
		});
	}
}