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
import { ProgressStatusService } from 'src/app/service/progress-status.service';
import { ProgressStatus } from 'src/app/model/progress-status';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-queue-manager-main-window',
	templateUrl: './queue-manager-main-window.component.html',
	styleUrl: './queue-manager-main-window.component.css',
	standalone: true,
	imports: [CdkDropListGroup, FormsModule, KeyValuePipe, AudioControlComponent, QueueWindowComponent],
})
export class QueueManagerMainWindowComponent implements OnInit {

	readonly audioFileService = inject(AudioFileService);
	readonly databaseService = inject(DatabaseService);
	readonly dialog = inject(MatDialog);
	readonly fileSystemService = inject(FileSystemService);
	readonly errorService = inject(ErrorService);
	readonly progressStatusService = inject(ProgressStatusService);
	readonly queueService = inject(QueueService);

	progressDialog?: MatDialogRef<ProgressOverlayComponent, any>;

	queueTypes!: Record<string, QueueType>;
	queueTypeArray!: QueueType[];
	queues!: Record<string, Queue>;
	newQueueType: string = "";
	progressStatusSubject: Subject<ProgressStatus> = new Subject();

	async ngOnInit() {
		this.progressStatusService.progress.subscribe((status: any) => {
			if (status && !this.progressDialog) {
				this.progressDialog = this.dialog.open(ProgressOverlayComponent, {
					data: this.progressStatusSubject
				});
			} else if (!status && this.progressDialog) {
				this.progressDialog?.close();
				this.progressDialog = undefined;
			}
			if (status) {
				this.progressStatusSubject.next(status);
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
		this.queueTypes = await this.databaseService.getQueueTypes();
		this.queueTypeArray = Object.values(this.queueTypes);
		this.queues = await this.databaseService.getQueues();
		this.audioFileService.init();

		if (!window['showDirectoryPicker']) {
			this.errorService.errorDialog("You browser does not support access to your filesystem. Please use Chrome or Edge.");
		}

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

	onQueueChange() {
		this.databaseService.saveQueues();
	}

	onHelp() {
		window.open("https://github.com/radioqueues/radioqueues");
	}
}