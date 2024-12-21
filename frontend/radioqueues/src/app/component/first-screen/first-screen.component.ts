import { Component, inject, output } from '@angular/core';
import { FileSystemService } from 'src/app/service/filesystem.service';

@Component({
    selector: 'app-first-screen',
    templateUrl: './first-screen.component.html',
    styleUrl: './first-screen.component.css'
})
export class FirstScreenComponent {
	accessGranted = output();
	private fileSystemService = inject(FileSystemService);

	async onPickRoot() {
		await this.fileSystemService.pickRoot();
		this.accessGranted.emit();
	}
}
