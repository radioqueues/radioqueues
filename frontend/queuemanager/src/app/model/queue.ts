import { Entry } from "./entry";

export class Queue extends Entry {
	uuid!: string;
	entries!: Entry[];
	type!: string;
	visible?: boolean = false;
}