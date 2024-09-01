import { Entry } from "./entry";

export class Queue extends Entry {
	entries!: Entry[];
	type!: string;
	visible?: boolean = false;
}