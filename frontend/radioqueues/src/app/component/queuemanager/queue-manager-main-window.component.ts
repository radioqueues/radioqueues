import { Component, OnInit, inject } from '@angular/core';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
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
	readonly queueService = inject(QueueService);

	queueTypes!: Record<string, QueueType>;
	queueTypeArray!: QueueType[];
	queues!: Record<string, Queue>;
	newQueueType: string = "";

	async ngOnInit() {
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