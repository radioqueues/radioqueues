import { Component, HostListener, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { QueueManagerMainWindowComponent } from './component/queuemanager/queue-manager-main-window.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorService } from './service/error.service';
import { ProgressStatusService } from './service/progress-status.service';
import { Subject } from 'rxjs';
import { ProgressStatus } from './model/progress-status';
import { ProgressOverlayComponent } from './component/progress-overlay/progress-overlay.component';
import { ErrorDialogComponent } from './component/error-dialog/error-dialog.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [QueueManagerMainWindowComponent]
})
export class AppComponent implements OnInit {
	private title = inject(Title);
	
	readonly dialog = inject(MatDialog);
	readonly errorService = inject(ErrorService);
	readonly progressStatusService = inject(ProgressStatusService);

	progressDialog?: MatDialogRef<ProgressOverlayComponent, any>;
	progressStatusSubject: Subject<ProgressStatus> = new Subject();


	constructor() {
		this.displayVersion();
	}

	async ngOnInit() {
		this.progressStatusService.progress.subscribe((status: any) => {
			if (status && !this.progressDialog) {
				this.progressDialog = this.dialog.open(ProgressOverlayComponent, {
					data: this.progressStatusSubject
				});
			} else if (!status && this.progressDialog) {
				this.progressDialog?.close();
				this.progressDialog = undefined;
			}
			if (status) {
				this.progressStatusSubject.next(status);
			}
		});
		this.errorService.errors.subscribe((status: any) => {
			if (status) {
				this.dialog.open(ErrorDialogComponent, {
					data: {
						errorMessage: status.errorMessage
					}
				});
			}
		});
	}

	async displayVersion() {
		let response = await fetch("ngsw.json");
		let json = await response.json();
		let version = "v" + new Date(json['timestamp']).toISOString().slice(0, 10).replace(/-/g, ".");
		let prefix = "RadioQueues ";
		if (window.matchMedia('(display-mode: standalone)').matches) {
			prefix = "";
		}
		this.title.setTitle(prefix + version);
	}

	@HostListener('window:dragover', ['$event'])
	@HostListener('window:drop', ['$event'])
	onDragOver(event: Event) {
		event.preventDefault();
	}
}
