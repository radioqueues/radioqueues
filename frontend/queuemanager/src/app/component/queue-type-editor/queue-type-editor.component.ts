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

@Component({
	selector: 'app-queue-type-editor',
	templateUrl: './queue-type-editor.component.html',
	styleUrl: './queue-type-editor.component.css',
	standalone: true,
	imports: [CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
})
export class QueueTypeEditorComponent {
	queueTypes = MockData.queueTypes;
}