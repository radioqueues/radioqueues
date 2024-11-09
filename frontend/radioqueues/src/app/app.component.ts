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
import { FileSystemService } from './service/filesystem.service';
import { FirstScreenComponent } from './component/first-screen/first-screen.component';
import { AudioFileService } from './service/audio-file.service';
import { DatabaseService } from './service/database.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [FirstScreenComponent, QueueManagerMainWindowComponent]
})
export class AppComponent implements OnInit {

	private readonly dialog = inject(MatDialog);
	private readonly title = inject(Title);

	private readonly audioFileService = inject(AudioFileService);
	private readonly databaseService = inject(DatabaseService);
	private readonly errorService = inject(ErrorService);
	private readonly fileSystemService = inject(FileSystemService);
	private readonly progressStatusService = inject(ProgressStatusService);

	progressDialog?: MatDialogRef<ProgressOverlayComponent, any>;
	progressStatusSubject: Subject<ProgressStatus> = new Subject();

	showFirstScreen = false;
	showMainWindow = false;	

	constructor() {
		this.displayVersion();
	}

	async ngOnInit() {
		this.initStatusDialogSubscription();
		this.initErrorDialogSubscription();

		if (!window['showDirectoryPicker']) {
			this.errorService.errorDialog("You browser does not support access to your filesystem. Please use Chrome or Edge.");
		}

		await this.databaseService.init();
		this.audioFileService.init();
		await this.fileSystemService.init();
		if (this.fileSystemService.rootHandle) {
			this.showMainWindow = true;
		} else {
			this.showFirstScreen = true;
		}
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

	initStatusDialogSubscription() {
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
	}

	initErrorDialogSubscription() {
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

	@HostListener('window:dragover', ['$event'])
	@HostListener('window:drop', ['$event'])
	onDragOver(event: Event) {
		event.preventDefault();
	}
}
