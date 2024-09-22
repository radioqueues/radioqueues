import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { ProgressStatus } from 'src/app/model/progress-status';
import { ProgressStatusService } from 'src/app/service/progress-status.service';


@Component({
	selector: 'app-progress-overlay',
	templateUrl: './progress-overlay.component.html',
	styleUrl: './progress-overlay.component.css',
	standalone: true,
	imports: [CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class ProgressOverlayComponent implements OnInit {
	progressStatusService = inject(ProgressStatusService);
	status?: ProgressStatus;

	async ngOnInit() {
		this.progressStatusService.progress.subscribe((status: any) => {
			this.status = status;
		})
	}

}