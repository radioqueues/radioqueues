export class Entry {
	name?: string;
	scheduled?: Date;
	offset?: Date;
	duration?: number;
	color? = "#000";
	queueRef?: string;

	public constructor(name?: string, scheduled?: Date, offset?: Date, duration?: number, color?: string, queueRef?: string) {
		this.name = name;
		if (offset) {
			this.offset = new Date(offset);
		}
		if (scheduled) {
			this.scheduled = new Date(scheduled);
		}
		this.duration = duration;
		this.color = color;
		this.queueRef = queueRef;
	}
}
