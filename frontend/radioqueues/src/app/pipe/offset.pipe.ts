import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'offset',
	standalone: true
})
export class OffsetPipe implements PipeTransform {
	formatter: Intl.DateTimeFormat;

	constructor() {
		this.formatter = new Intl.DateTimeFormat('en-GB', {
		  hour: '2-digit',
		  minute: '2-digit',
		  second: '2-digit',
		  hour12: false,
		});
	}

	transform(offset?: Date): string {
		if (!offset || isNaN(offset.getTime())) {
			return "??:??:??";
		}
		return this.formatter.format(offset);
	}

}