import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ProgressStatus } from "../model/progress-status";

@Injectable()
export class ProgressStatusService {

	progress: Subject<ProgressStatus|undefined> = new Subject<ProgressStatus|undefined>();

	next(progressStatus?: ProgressStatus) {
	    this.progress.next(progressStatus);
	}
}