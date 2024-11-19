import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';

import {
    MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ProgressStatus } from 'src/app/model/progress-status';
import { ProgressStatusService } from 'src/app/service/progress-status.service';


@Component({
    selector: 'app-progress-overlay',
    templateUrl: './progress-overlay.component.html',
    styleUrl: './progress-overlay.component.css',
    imports: [CommonModule, MatDialogTitle, MatDialogContent]
})
export class ProgressOverlayComponent {
	progressStatusService = inject(ProgressStatusService);
	status?: ProgressStatus;

	constructor(@Inject(MAT_DIALOG_DATA) public statusObservable: Observable<ProgressStatus>) {
		statusObservable.subscribe((status: any) => {
			this.status = status;
		});
	}

}