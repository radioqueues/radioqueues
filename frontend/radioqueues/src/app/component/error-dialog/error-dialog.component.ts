import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import {
    MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { ErrorService } from 'src/app/service/error.service';


@Component({
    selector: 'app-error-dialog',
    templateUrl: './error-dialog.component.html',
    styleUrl: './error-dialog.component.css',
    imports: [CommonModule, MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose]
})
export class ErrorDialogComponent {
	errorService = inject(ErrorService);

	constructor(@Inject(MAT_DIALOG_DATA) public data: {errorMessage: string}) {
	}

}
