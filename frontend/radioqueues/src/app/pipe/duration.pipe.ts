import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'duration',
	standalone: true
})
export class DurationPipe implements PipeTransform {

	transform(duration?: number): string {
		if (!duration || duration <= -1) {
			return "??:??";
		}
		if (duration <= 0) {
			return "00:00"
		}
		let minutes = Math.floor((duration / 1000) / 60);
		let seconds = Math.floor((duration / 1000) % 60);
		return this.pad2(minutes) + ":" + this.pad2(seconds);
	}

	pad2(num: number) {
		if (num < 10) {
			return "0" + num;
		}
		return "" + num;
	}
}