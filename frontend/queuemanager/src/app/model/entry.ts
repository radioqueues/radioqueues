import { Queue } from "./queue";

export class Entry {
	name?: string;
	offset?: Date;
	duration?: number;
	color? = "#000";
	queue?: Queue;
}