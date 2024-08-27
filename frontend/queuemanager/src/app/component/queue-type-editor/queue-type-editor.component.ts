import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MockData } from 'src/app/service/queue.mock';

import {MatButtonModule} from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';


@Component({
	selector: 'app-queue-type-editor',
	templateUrl: './queue-type-editor.component.html',
	styleUrl: './queue-type-editor.component.css',
	standalone: true,
	imports: [CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, MatTableModule],
})
export class QueueTypeEditorComponent {
	readonly displayedColumns = ["name", "color", "jingleStart", "jingleEnd", "scheduleTime", "scheduleStrategy", "folder"];
	
	queueTypes = Object.values(MockData.queueTypes);
}