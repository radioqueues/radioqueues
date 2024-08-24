import { Component, Input } from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';

import { Queue } from 'src/app/model/queue';
import { QueueComponent } from '../queue/queue.component';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-queue-window',
	templateUrl: './queue-window.component.html',
	styleUrl: './queue-window.component.css',
	standalone: true,
	imports: [FormsModule, MatExpansionModule, QueueComponent],
})
export class QueueWindowComponent {
	@Input({required: true}) queue!: Queue;
	@Input() readonly?: boolean;
	@Input() subQueueContentToggle: boolean = false;
	showSubQueueContent: boolean = true;

}