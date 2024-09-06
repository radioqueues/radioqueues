export class Entry {
	name?: string;
	offset?: Date|string;   // TODO: string is a temporary workaround for mock data
	duration?: number;
	color? = "#000";
	queueRef?: string;

	public constructor(name: string, offset: Date|string, duration: number, color?: string) {
		this.name = name;
		this.offset = offset;
		this.duration = duration;
		this.color = color;
	}
}