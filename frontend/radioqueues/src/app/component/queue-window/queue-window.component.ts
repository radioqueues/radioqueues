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

class Rect {
	left: number = 0;
	top: number = 0;
	width: number = 0;
	height: number = 0;
}

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

	private elRef = inject(ElementRef);

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
	static numberOfOpenedWindows = 0;
	windowRect = { top: 30, left: 5, width: 500, height: 300 };

	private lastMouseX = 0;
	private lastMouseY = 0;

	constructor() {
		this.bringToFront();

		QueueWindowComponent.numberOfOpenedWindows++;
		this.findPosition();
	}

	getRect(element: HTMLElement): Rect {
	    const rect = element.getBoundingClientRect();
	    return {
	        left: rect.left + document.documentElement.scrollLeft,
	        top: rect.top + document.documentElement.scrollTop,
			height: rect.height,
			width: rect.width
	    };
	}

	isOverlaping(rect1: Rect, rect2: Rect) {
		console.log(rect1.left < rect2.left + rect2.width, 
					rect1.left + rect1.width > rect2.left,
					rect1.top < rect2.top + rect2.height,
					rect1.top + rect1.height > rect2.top)
		return rect1.left < rect2.left + rect2.width
			&& rect1.left + rect1.width > rect2.left
			&& rect1.top < rect2.top + rect2.height
			&& rect1.top + rect1.height > rect2.top 
	}

	findPosition() {
		let me = this.elRef.nativeElement;
		let containerElement = document.getElementsByTagName("app-queue-manager-main-window")[0];
		let knownRects: any[] = [];
		for (let child of containerElement.querySelectorAll("div.window") as NodeListOf<HTMLElement>) {
			if (child !== me) {
				knownRects.push(this.getRect(child));
			}
		}
		let workspaceRect = this.getRect(document.documentElement);

		for (let h = 30; h < workspaceRect.height - 30 - this.windowRect.height; h = h + 20) {
			for (let w = 5; w < workspaceRect.width - 30 - this.windowRect.width; w = w + 20) {
				this.windowRect.left = w;
				this.windowRect.top = h;
				let overlap = false;
				for (let knownRect of knownRects) {
					if (this.isOverlaping(knownRect, this.windowRect)) {
						overlap = true;
						break;
					}
				}
				if (!overlap) {
					return;
				}
			}
		}
		console.log("Cannot place window, stacking");
		let modifier = QueueWindowComponent.numberOfOpenedWindows % 10;
		this.windowRect.top = 20 + modifier * 50;
		this.windowRect.left = 20 + modifier * 100;
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
			this.windowRect.left += dx;
			this.windowRect.top += dy;
			if (this.windowRect.left < 0) {
				this.windowRect.left = 0;
			}
			if (this.windowRect.top < 0) {
				this.windowRect.top = 0;
			}
		}
		if (this.isResizing) {
			this.windowRect.width += dx;
			this.windowRect.height += dy;
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