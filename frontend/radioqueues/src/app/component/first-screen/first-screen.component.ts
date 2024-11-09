import { Component, inject } from '@angular/core';
import { FileSystemService } from 'src/app/service/filesystem.service';

@Component({
  selector: 'app-first-screen',
  standalone: true,
  imports: [],
  templateUrl: './first-screen.component.html',
  styleUrl: './first-screen.component.css'
})
export class FirstScreenComponent {
	private fileSystemService = inject(FileSystemService);

	onPickRoot() {
		this.fileSystemService.pickRoot();
	}
}
