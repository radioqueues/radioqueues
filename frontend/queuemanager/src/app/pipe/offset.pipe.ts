import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'offset',
	standalone: true
})
export class OffsetPipe implements PipeTransform {

	transform(offset?: Date | string): string {
		if (!offset) {
			return "??:??:??";
		}
		return offset.toString().substring(11);
	}

}