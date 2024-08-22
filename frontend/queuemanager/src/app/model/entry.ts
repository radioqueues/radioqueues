import { Queue } from "./queue";

export class Entry {
	name?: string;
	offset?: Date|string;   // TODO: string is a temporary workaround for mock data
	duration?: number;
	color? = "#000";
	queue?: Queue;
}