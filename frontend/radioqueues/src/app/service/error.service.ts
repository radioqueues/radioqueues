import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class ErrorService {
	errors: Subject<any> = new Subject();

	public errorDialog(message: string) {
		this.errors.next({
			errorMessage: message
		});
	}
}
