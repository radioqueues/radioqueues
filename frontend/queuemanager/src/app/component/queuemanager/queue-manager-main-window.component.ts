import { Component, OnInit, inject } from '@angular/core';
import {
	CdkDropListGroup,
} from '@angular/cdk/drag-drop';

import {
  MatDialog
} from '@angular/material/dialog';

import { QueueWindowComponent } from '../queue-window/queue-window.component';
import { QueueTypeEditorComponent } from '../queue-type-editor/queue-type-editor.component';
import { FileSystemService } from 'src/app/service/filesystem.service';
import { Queue } from 'src/app/model/queue';
import { DatabaseService } from 'src/app/service/database.service';
import { QueueType } from 'src/app/model/queue-type';
import { FormsModule } from '@angular/forms';
import { Entry } from 'src/app/model/entry';
import { QueueService } from 'src/app/service/queue.service';

@Component({
	selector: 'app-queue-manager-main-window',
	templateUrl: './queue-manager-main-window.component.html',
	styleUrl: './queue-manager-main-window.component.css',
	standalone: true,
	imports: [CdkDropListGroup, FormsModule, QueueWindowComponent],
})
export class QueueManagerMainWindowComponent implements OnInit {

	readonly dialog = inject(MatDialog);
	readonly databaseService = inject(DatabaseService);
	readonly fileSystemService = inject(FileSystemService);
	readonly queueService = inject(QueueService);

	queueTypes!: Record<string, QueueType>;
	queueTypeArray!: QueueType[];
	queues!: Queue[];
	newQueueType: string = "";
	
	async ngOnInit() {
		this.queueTypes = await this.databaseService.getQueueTypes();
		this.queueTypeArray = Object.values(this.queueTypes);
		this.queues = await this.databaseService.getQueues();
		if (this.queues) {
			this.queues[1].entries.push(this.queues[2]);
			this.queues[1].entries.push({ "name": "Musik", "offset": "2024-08-16 10:03:20", duration: (11*60+40)*1000, color: "#AAA" });
			this.queues[1].entries.push(this.queues[7]);
			this.queues[1].entries.push({ "name": "Musik", "offset": "2024-08-16 10:16:22", duration: (28 * 60 + 38) * 1000, color: "#AAA" });
			this.queues[1].entries.push(this.queues[8]);
			this.queues[1].entries.push({ "name": "Musik", "offset": "2024-08-16 10:46:34", duration: (13 * 60 + 26) * 1000, color: "#AAA" });
			this.queues[1].entries.push(this.queues[3]);
			this.queues[1].entries.push({ "name": "Musik", "offset": "2024-08-16 11:04:08", duration: (10 * 60 + 52) * 1000, color: "#AAA" });
			this.queues[1].entries.push(this.queues[9]);
			this.queues[1].entries.push({ "name": "Musik", "offset": "2024-08-16 11:17:03", duration: (12 * 60 + 57) * 1000, color: "#AAA" });
			this.queues[1].entries.push(this.queues[4]);
			this.queues[1].entries.push({ "name": "Musik", "offset": "2024-08-16 11:31:40", duration: (13 * 60 + 20) * 1000, color: "#AAA" });
		}
	}

	newQueue() {
		console.log(this.newQueueType);
		if (this.newQueueType) {
			this.queueService.createNewQueueOrShowInternalQueue(this.newQueueType);
		}

		// TODO: reset select box to empty entry does not work
		this.newQueueType = "";
	}


	onSettingsClicked() {
		this.dialog.open(QueueTypeEditorComponent);
	}

	onPickRoot() {
		this.fileSystemService.pickRoot();
	}
}