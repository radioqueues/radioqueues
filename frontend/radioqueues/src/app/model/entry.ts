export class Entry {
	name?: string;
	offset?: Date;
	duration?: number;
	color? = "#000";
	queueRef?: string;

	public constructor(name?: string, offset?: Date, duration?: number, color?: string, queueRef?: string) {
		this.name = name;
		if (offset) {
			this.offset = new Date(offset);
			}
		this.duration = duration;
		this.color = color;
		this.queueRef = queueRef;
	}
}
