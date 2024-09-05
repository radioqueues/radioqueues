import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'title',
	standalone: true
})
export class TitlePipe implements PipeTransform {

	transform(title?: string): string {
		if (!title) {
			return "";
		}
		let lower = title.toLowerCase();
		if (lower.endsWith(".wav") || lower.endsWith(".mp3")) {
			title = title.substring(0, title.length - 4);
		}
		let pos = title.lastIndexOf("/");
		if (pos > -1) {
			title = title.substring(pos + 1);
		}
		return title;
	}
}