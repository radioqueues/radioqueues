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
import { QueueService } from 'src/app/service/queue.service';
import { KeyValuePipe } from '@angular/common';

@Component({
	selector: 'app-queue-manager-main-window',
	templateUrl: './queue-manager-main-window.component.html',
	styleUrl: './queue-manager-main-window.component.css',
	standalone: true,
	imports: [CdkDropListGroup, FormsModule, KeyValuePipe, QueueWindowComponent],
})
export class QueueManagerMainWindowComponent implements OnInit {

	readonly dialog = inject(MatDialog);
	readonly databaseService = inject(DatabaseService);
	readonly fileSystemService = inject(FileSystemService);
	readonly queueService = inject(QueueService);

	queueTypes!: Record<string, QueueType>;
	queueTypeArray!: QueueType[];
	queues!: Record<string, Queue>;
	newQueueType: string = "";
	
	async ngOnInit() {
		this.queueTypes = await this.databaseService.getQueueTypes();
		this.queueTypeArray = Object.values(this.queueTypes);
		this.queues = await this.databaseService.getQueues();
		if (this.queues) {
			this.queues["m0lhjegw-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b"].entries.push(this.queues["m0lhjf1s-4b0c008f-2106-456a-80f1-ad71db9c713f"]);
			this.queues["m0lhjegw-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b"].entries.push({ "name": "Musik", "offset": "2024-08-16 10:03:20", duration: (11*60+40)*1000, color: "#AAA" });
			this.queues["m0lhjegw-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b"].entries.push(this.queues["m0lhmjkr-d0bc2606-65e9-4486-b392-9d9ba790697e"]);
			this.queues["m0lhjegw-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b"].entries.push({ "name": "Musik", "offset": "2024-08-16 10:16:22", duration: (28 * 60 + 38) * 1000, color: "#AAA" });
			this.queues["m0lhjegw-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b"].entries.push(this.queues["m0lhmjyk-486179b7-24de-4e8c-bbed-dfca99cade5b"]);
			this.queues["m0lhjegw-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b"].entries.push({ "name": "Musik", "offset": "2024-08-16 10:46:34", duration: (13 * 60 + 26) * 1000, color: "#AAA" });
			this.queues["m0lhjegw-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b"].entries.push(this.queues["m0lhjfsw-83d57ec7-8f33-4e40-b267-fe64ca529a37"]);
			this.queues["m0lhjegw-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b"].entries.push({ "name": "Musik", "offset": "2024-08-16 11:04:08", duration: (10 * 60 + 52) * 1000, color: "#AAA" });
			this.queues["m0lhjegw-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b"].entries.push(this.queues["m0lhmkb0-6952359f-1fa5-4fd6-a3e4-4e16ad94b6c0"]);
			this.queues["m0lhjegw-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b"].entries.push({ "name": "Musik", "offset": "2024-08-16 11:17:03", duration: (12 * 60 + 57) * 1000, color: "#AAA" });
			this.queues["m0lhjegw-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b"].entries.push(this.queues["m0lhjt0p-64ecb5f6-74b5-4564-bdd5-f497f20dcbf6"]);
			this.queues["m0lhjegw-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b"].entries.push({ "name": "Musik", "offset": "2024-08-16 11:31:40", duration: (13 * 60 + 20) * 1000, color: "#AAA" });
		}
		console.log(this.queues);
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