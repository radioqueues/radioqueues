import { Queue } from "./queue";

export class Entry {
	name?: string;
	offset?: Date|string;   // TODO: string is a temporary workaround for mock data
	duration?: number;
	color? = "#000";
	queue?: Queue;

	public constructor(name: string, offset: Date|string, duration: number, color?: string) {
		this.name = name;
		this.offset = offset;
		this.duration = duration;
		this.color = color;
	}
}