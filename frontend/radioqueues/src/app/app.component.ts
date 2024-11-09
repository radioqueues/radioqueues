import { Component, HostListener, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { QueueManagerMainWindowComponent } from './component/queuemanager/queue-manager-main-window.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [QueueManagerMainWindowComponent]
})
export class AppComponent {
	private title = inject(Title);

	constructor() {
		this.displayVersion();
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
