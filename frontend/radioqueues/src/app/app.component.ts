import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [RouterOutlet]
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
}
