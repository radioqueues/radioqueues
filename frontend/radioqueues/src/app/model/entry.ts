export class Entry {
	name?: string;
	offset?: Date;
	duration?: number;
	color? = "#000";
	queueRef?: string;

	public constructor(name: string, offset: Date, duration: number, color?: string) {
		this.name = name;
		this.offset = offset;
		this.duration = duration;
		this.color = color;
	}
}