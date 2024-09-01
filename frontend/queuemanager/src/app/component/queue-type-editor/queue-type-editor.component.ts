import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';

import {MatButtonModule} from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';
import { QueueType } from 'src/app/model/queue-type';
import { FileSystemService } from 'src/app/service/filesystem.service';


@Component({
	selector: 'app-queue-type-editor',
	templateUrl: './queue-type-editor.component.html',
	styleUrl: './queue-type-editor.component.css',
	standalone: true,
	imports: [CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, MatTableModule],
})
export class QueueTypeEditorComponent implements OnInit {
	readonly fileSystemService = inject(FileSystemService);

	readonly displayedColumns = ["name", "color", "jingleStart", "jingleEnd", "scheduleTime", "scheduleStrategy", "folder"];
	
	queueTypes!: Array<QueueType>;

	async ngOnInit() {
		this.queueTypes = Object.values(await this.fileSystemService.getJsonFromFilename("queuemanager/queue-types.json"));

	}
	
}