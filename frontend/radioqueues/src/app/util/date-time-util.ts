export class DateTimeUtil {

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
}
