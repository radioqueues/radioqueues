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

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	imports: [FirstScreenComponent, QueueManagerMainWindowComponent],
	standalone: true
})
export class AppComponent implements OnInit {

	private readonly dialog = inject(MatDialog);
	private readonly title = inject(Title);

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


	/*
	Startup sequences
	1. init status und error dialog listeners
	2. check browser support
	3. init filesystem access
	4. If no filesystem access possible, show FirstScreenComponent
	   ---> continue after directory was picked
	5. If filesystem access is possible, load database
	6. Show main window
	7. init AudioFileService
	8. rescan folder
	9. setup interval timer to rescan folder
	 */

	async ngOnInit() {
		this.initStatusDialogSubscription();
		this.initErrorDialogSubscription();

		if (!window['showDirectoryPicker']) {
			this.errorService.errorDialog("You browser does not support access to your filesystem. Please use Chrome or Edge.");
		}

		await this.fileSystemService.init();
		if (this.fileSystemService.rootHandle) {
			this.showMainWindow = true;
		} else {
			this.showFirstScreen = true;
		}
	}

	onAccessGranted() {
		this.showFirstScreen = false;
		this.showMainWindow = true;
	}

	async displayVersion() {
		let version = "v" + new Date(document.lastModified).toISOString().slice(0, 10)?.replace(/-/g, ".");
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
