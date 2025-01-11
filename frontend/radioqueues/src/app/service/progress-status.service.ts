import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ProgressStatus } from "../model/progress-status";

@Injectable({
	providedIn: 'root'
})
export class ProgressStatusService {

	progress: Subject<ProgressStatus | undefined> = new Subject<ProgressStatus | undefined>();
	lastStatus: any;

	next(progressStatus?: ProgressStatus) {
		this.lastStatus = progressStatus;
		this.progress.next(progressStatus);
	}
}