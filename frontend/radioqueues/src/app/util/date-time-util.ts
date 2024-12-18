export class DateTimeUtil {

	public static fakeNow?: Date;
	private static readonly END_OF_TIME = new Date("+199999-01-01T00:00:00.000Z");

	static now(): Date {
		return this.fakeNow || new Date();
	}

	static parseTime(str?: string) {
		if (!str) {
			throw new Error("The time must not be empty.");
		}

		let sep = str.indexOf(":");
		if (sep < 1 || sep > 4) {
			throw new Error("The time needs to be specified in the format HH:MM.");
		}
		let hours = Number.parseInt(str.substring(0, sep));
		let minutes = Number.parseInt(str.substring(sep + 1));
		if (Number.isNaN(hours) || Number.isNaN(minutes)) {
			throw new Error("The time needs to be specified in the format HH:MM. With HH and MM being numbers.");
		}
		if (hours < 0 || hours > 23) {
			throw new Error("The time needs to be specified in the format HH:MM. With HH being a number between 0 and 23.");
		}
		if (minutes < 0 || minutes > 59) {
			throw new Error("The time needs to be specified in the format HH:MM. With MM being a number between 0 and 59.");
		}

		return hours * 60 + minutes;
	}

	static datetimeFromTime(time: number) {
		let now = this.now();
		let currentTime = now.getHours() * 60 + now.getMinutes();
		let schedule = new Date(now);
		let diff = currentTime - time;
		if (time < currentTime) {
			if (diff < 2 * 60) {
				throw new Error("Time is in the past.");
			}
			schedule.setDate(now.getDate() + 1);
		} else if (diff < -22 * 60) {
			throw new Error("Time is in the past.");
		}
		schedule.setHours(Math.floor(time / 60));
		schedule.setMinutes(time % 60);
		schedule.setSeconds(0);
		return schedule;
	}

	/**
	 * changes the date of a datetime value to today, 
	 * unless it is a pseudo data from beyond the end of time.
	 *
	 * @param toModify date object to modify
	 * @param toDate date to which the first parameter should be changed to
	 */
	static changeDateTimeToDate(toModify: Date, toChangeTo: Date) {
		if (toModify > DateTimeUtil.END_OF_TIME) {
			return;
		}
		toModify.setFullYear(toChangeTo.getFullYear());
		toModify.setMonth(toChangeTo.getMonth());
		toModify.setDate(toChangeTo.getDate());
	}
}
