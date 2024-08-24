import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { Queue } from 'src/app/model/queue';
import { QueueComponent } from '../queue/queue.component';

@Component({
	selector: 'app-queue-window',
	templateUrl: './queue-window.component.html',
	styleUrl: './queue-window.component.css',
	standalone: true,
	imports: [FormsModule, MatCheckboxModule, MatToolbarModule, MatButtonModule, MatIconModule, MatExpansionModule, QueueComponent],
})
export class QueueWindowComponent {
	@Input({ required: true }) queue!: Queue;
	@Input() readonly?: boolean;
	@Input() subQueueContentToggle: boolean = false;
	showSubQueueContent: boolean = true;

}