import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import {
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogTitle,
} from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { QueueType } from 'src/app/model/queue-type';
import { DatabaseService } from 'src/app/service/database.service';


@Component({
	selector: 'app-queue-type-editor',
	templateUrl: './queue-type-editor.component.html',
	styleUrl: './queue-type-editor.component.css',
	imports: [CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, MatTableModule],
	standalone: true
})
export class QueueTypeEditorComponent implements OnInit {
	readonly databaseService = inject(DatabaseService);

	readonly displayedColumns = ["name", "color", "jingles", "scheduleTime", "scheduleStrategy", "folder"];

	queueTypes!: Array<QueueType>;

	async ngOnInit() {
		this.queueTypes = Object.values(await this.databaseService.getQueueTypes());

	}

}