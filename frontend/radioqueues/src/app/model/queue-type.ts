export class QueueType {
	name!: string;
	color?: string;
	jingles?: string[];
	scheduleTime?: string;
	scheduleStrategy?: "internal" | "manual" | "clone" | "subset-sum";
	folder?: string;
}