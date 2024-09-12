import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { AudioFileService } from 'src/app/service/audio-file.service';


@Component({
	selector: 'app-progress-overlay',
	templateUrl: './progress-overlay.component.html',
	styleUrl: './progress-overlay.component.css',
	standalone: true,
	imports: [CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class ProgressOverlayComponent implements OnInit {
	audioFileService = inject(AudioFileService);
	status = {
		current: 0,
		count: "?"
	};

	async ngOnInit() {
		this.audioFileService.process.subscribe((status: any) => {
			this.status = status;
		})
	}

}