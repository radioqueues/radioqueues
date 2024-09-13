import { Component, OnInit, inject } from '@angular/core';
import {
	CdkDropListGroup,
} from '@angular/cdk/drag-drop';

import {
	MatDialog,
	MatDialogRef
} from '@angular/material/dialog';

import { QueueWindowComponent } from '../queue-window/queue-window.component';
import { QueueTypeEditorComponent } from '../queue-type-editor/queue-type-editor.component';
import { FileSystemService } from 'src/app/service/filesystem.service';
import { Queue } from 'src/app/model/queue';
import { DatabaseService } from 'src/app/service/database.service';
import { QueueType } from 'src/app/model/queue-type';
import { FormsModule } from '@angular/forms';
import { ErrorService } from 'src/app/service/error.service';
import { QueueService } from 'src/app/service/queue.service';
import { KeyValuePipe } from '@angular/common';
import { AudioFileService } from 'src/app/service/audio-file.service';
import { AudioControlComponent } from '../audio-control/audio-control.component';
import { ProgressOverlayComponent } from '../progress-overlay/progress-overlay.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { Entry } from 'src/app/model/entry';

@Component({
	selector: 'app-queue-manager-main-window',
	templateUrl: './queue-manager-main-window.component.html',
	styleUrl: './queue-manager-main-window.component.css',
	standalone: true,
	imports: [CdkDropListGroup, FormsModule, KeyValuePipe, AudioControlComponent, QueueWindowComponent],
})
export class QueueManagerMainWindowComponent implements OnInit {

	readonly audioFileService = inject(AudioFileService);
	readonly dialog = inject(MatDialog);
	readonly databaseService = inject(DatabaseService);
	readonly errorService = inject(ErrorService);
	readonly fileSystemService = inject(FileSystemService);
	readonly queueService = inject(QueueService);

	progressDialog?: MatDialogRef<ProgressOverlayComponent, any>;

	queueTypes!: Record<string, QueueType>;
	queueTypeArray!: QueueType[];
	queues!: Record<string, Queue>;
	newQueueType: string = "";

	async ngOnInit() {
		this.queueTypes = await this.databaseService.getQueueTypes();
		this.queueTypeArray = Object.values(this.queueTypes);
		this.queues = await this.databaseService.getQueues();
		this.audioFileService.init();
		this.audioFileService.process.subscribe((status: any) => {
			if (status && !this.progressDialog) {
				this.progressDialog = this.dialog.open(ProgressOverlayComponent);
			} else if (!status && this.progressDialog) {
				this.progressDialog?.close();
				this.progressDialog = undefined;
			}
		});
		this.errorService.errors.subscribe((status: any) => {
			if (status) {
				this.dialog.open(ErrorDialogComponent, {
					data: {
						errorMessage: status.errorMessage
					}
				});
			}
		});

		console.log(this.queues);
	}

	newQueue() {
		console.log(this.newQueueType);
		if (this.newQueueType) {
			this.queueService.createNewQueueOrShowInternalQueue(this.newQueueType);
		}

		this.newQueueType = "";
		// reset select box to empty entry using the above line does not work
		(document.getElementById("newQueue") as HTMLSelectElement).value = "";
	}


	onSettingsClicked() {
		this.dialog.open(QueueTypeEditorComponent);
	}

	onPickRoot() {
		this.fileSystemService.pickRoot();
	}

	onDebugClicked() {
		let history = this.queues["m0lhjdqh-a78095b4-0c65-44a7-9555-bdcbd93d00a6"];
		let mainQueue = this.queues["m0lhjegw-8deb427b-ec8e-40de-a4ba-b30dbbcd5e0b"];
		mainQueue.entries = [];
		mainQueue.offset = history.entries[0].offset;
		console.log(history);
		let lastQueueType = "";
		let queue: Queue | undefined = undefined;
		for (let entry of history.entries) {

			let queueTypeName = "Musik";
			if (entry.name!.indexOf("Nachrichten") > -1) {
				queueTypeName = "Nachrichten";
			} else if (entry.name!.indexOf("Worlds Best Hits") > -1) {
				queueTypeName = "Nachrichten";
			} else if (entry.name!.indexOf("Jingle Verkehr") > -1) {
				queueTypeName = "Nachrichten";
			} else if (entry.name!.indexOf("Werbung") > -1) {
				queueTypeName = "Werbung";
			} else if (entry.name!.indexOf("Vorbereitet/FPS_Intro") > -1) {
				queueTypeName = "Werbung";
			}
			if (lastQueueType != "Nachrichten" && queueTypeName == "Nachrichten" && entry.name!.indexOf("Jingle") < 0) {
				queueTypeName = "Reportage";
			}


			if (queueTypeName != lastQueueType) {
				let queueType = this.queueTypes[queueTypeName];
				if (!queueType) {
					queueType = this.queueTypes["Musik"];
				}
				if (queue) {
					let entry: Entry = {
						"queueRef": queue.uuid,
						"name": queue.name,
						"offset": queue.offset,
						"duration": queue.duration,
						"color": queue.color
					};
					if (queue.type === "Nachrichten" || queue.type === "Werbung" || queue.type === "Reportage") {
						entry.scheduled = entry.offset;
					}
					mainQueue.entries.push(entry);
				}
				queue = queue = {
					uuid: "zzzz" + entry.offset + "-" + crypto.randomUUID(),
					name: queueTypeName + " " + entry.offset?.getHours() + ":" + entry.offset?.getMinutes(),
					offset: entry.offset,
					color: queueType.color,
					duration: 0,
					type: queueType.name,
					entries: []
				};
				this.queues[queue.uuid] = queue;
				lastQueueType = queueTypeName;
			}
			queue?.entries.push(entry);
			if (entry?.duration && entry?.duration > 0) {
				queue!.duration = queue!.duration! + entry.duration;
			}
		}
		if (queue) {
			mainQueue.entries.push({
				"queueRef": queue.uuid,
				"name": queue.name,
				"offset": queue.offset,
				"duration": queue.duration,
				"color": queue.color
			});
		}
		console.log(this.queues);
	}

	onQueueChange() {
		this.databaseService.saveQueues();
	}

}