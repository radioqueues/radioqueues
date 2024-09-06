export class QueueType {
	name!: string;
	color?: string;
	jingleStart?: string;
	jingleEnd?: string;
	scheduleTime?: string;
	scheduleStrategy?: "internal" | "manual" | "clone" | "subset-sum";
	folder?: string;
}