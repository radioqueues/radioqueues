import { Queue } from "./queue";

export class Entry {
	name?: string;
	offset?: Date;
	duration?: number;
	queue?: Queue;
}