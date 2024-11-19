import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import {MatRadioModule} from '@angular/material/radio';
import { ErrorService } from 'src/app/service/error.service';
import { DateTimeUtil } from 'src/app/util/date-time-util';

@Component({
    selector: 'app-schedule-dialog',
    templateUrl: './schedule-dialog.component.html',
    styleUrl: './schedule-dialog.component.css',
    imports: [
        CommonModule, FormsModule,
        MatButtonModule,
        MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose,
        MatRadioModule
    ]
})
export class ScheduleDialogComponent {

	private dialogRef: MatDialogRef<ScheduleDialogComponent, "next"|Date> = inject(MatDialogRef);
	private errorService = inject(ErrorService);

	time: string = "";
	option: string = "schedule";

	onTimeClicked() {
		console.log(this.option);
		this.option = "schedule";
	}

	onOkClicked() {
		if (this.option == "schedule") {
			try {
				let time = DateTimeUtil.parseTime(this.time);
				let date = DateTimeUtil.datetimeFromTime(time);
				this.dialogRef.close(date);
			} catch (error) {
				if (error instanceof Error) {
					this.errorService.errorDialog(error.message);
				}
			}
			return;	
		}
		this.dialogRef.close("next");
	}
}
