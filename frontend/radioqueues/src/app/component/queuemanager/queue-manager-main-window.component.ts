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
import { QueueService } from 'src/app/service/queue.service';
import { KeyValuePipe } from '@angular/common';
import { AudioControlComponent } from '../audio-control/audio-control.component';
import { IndexeddbCacheService } from 'src/app/service/indexeddb-cache.service';
import { AudioFileService } from 'src/app/service/audio-file.service';

@Component({
	selector: 'app-queue-manager-main-window',
	templateUrl: './queue-manager-main-window.component.html',
	styleUrl: './queue-manager-main-window.component.css',
	imports: [CdkDropListGroup, FormsModule, KeyValuePipe, AudioControlComponent, QueueWindowComponent],
	standalone: true
})
export class QueueManagerMainWindowComponent implements OnInit {

	private readonly audioFileService = inject(AudioFileService);
	private readonly databaseService = inject(DatabaseService);
	private readonly dialog = inject(MatDialog);
	private readonly fileSystemService = inject(FileSystemService);
	private readonly indexeddbCacheService = inject(IndexeddbCacheService);
	private readonly queueService = inject(QueueService);

	queueTypes!: Record<string, QueueType>;
	queueTypeArray!: QueueType[];
	queues!: Record<string, Queue>;
	newQueueType: string = "";

	async ngOnInit() {
		await this.databaseService.init();
		this.audioFileService.init();
		this.fileSystemService.scanFiles();

		this.queueTypes = await this.databaseService.getQueueTypes();
		this.queueTypeArray = Object.values(this.queueTypes);
		this.queues = await this.databaseService.getQueues();

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

	onScanFiles() {
		this.fileSystemService.scanFiles();
	}

	onSettingsClicked() {
		this.dialog.open(QueueTypeEditorComponent);
	}

	async onCloseProject() {
		await this.indexeddbCacheService.saveDirectoryHandle(undefined);
		window.location.reload();
	}

	onQueueChange() {
		this.databaseService.saveQueues();
	}

	onHelp() {
		window.open("https://github.com/radioqueues/radioqueues");
	}
}