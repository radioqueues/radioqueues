import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {MatButtonModule} from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';


@Component({
	selector: 'app-schedule-dialog',
	templateUrl: './schedule-dialog.component.html',
	styleUrl: './schedule-dialog.component.css',
	standalone: true,
	imports: [CommonModule, FormsModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
})
export class ScheduleDialogComponent {
	time: string = "xx:xx";
}