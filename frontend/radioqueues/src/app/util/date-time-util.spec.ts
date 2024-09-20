import { DateTimeUtil } from './date-time-util';

describe('DateTimeUtil', () => {
	it('parseTime', () => {
		expect(DateTimeUtil.parseTime("12:34")).toEqual(12 * 60 + 34);

		expect(function() {
			DateTimeUtil.parseTime("")
		}).toThrowError("The time must not be empty.");

		expect(function() {
			DateTimeUtil.parseTime("A")
		}).toThrowError("The time needs to be specified in the format HH:MM.");

		expect(DateTimeUtil.parseTime("1:4")).toEqual(1 * 60 + 4);

		expect(function() {
			DateTimeUtil.parseTime("1:A")
		}).toThrowError("The time needs to be specified in the format HH:MM. With HH and MM being numbers.");

		expect(function() {
			DateTimeUtil.parseTime("123:4")
		}).toThrowError("The time needs to be specified in the format HH:MM. With HH being a number between 0 and 23.");


		expect(function() {
			DateTimeUtil.parseTime("1:234")
		}).toThrowError("The time needs to be specified in the format HH:MM. With MM being a number between 0 and 59.");


		expect(function() {
			DateTimeUtil.parseTime("1234")
		}).toThrowError("The time needs to be specified in the format HH:MM.");

	});

	it('datetimeFromTime', () => {
		expect(DateTimeUtil.datetimeFromTime(new Date("2024-01-01 15:00"), 15 * 60 + 5)).toEqual(new Date("2024-01-01 15:05"));
		expect(DateTimeUtil.datetimeFromTime(new Date("2024-01-01 18:00"), 15 * 60 + 5)).toEqual(new Date("2024-01-02 15:05"));
		expect(DateTimeUtil.datetimeFromTime(new Date("2024-01-31 18:00"), 15 * 60 + 5)).toEqual(new Date("2024-02-01 15:05"));
		expect(DateTimeUtil.datetimeFromTime(new Date("2024-01-31 23:00"), 23 * 60 + 40)).toEqual(new Date("2024-01-31 23:40"));
		expect(DateTimeUtil.datetimeFromTime(new Date("2024-01-31 23:00"), 0 *  60 + 5)).toEqual(new Date("2024-02-01 00:05"));

		expect(function() {
			DateTimeUtil.datetimeFromTime(new Date("2024-01-31 18:00"), 17 * 60);
		}).toThrowError("Time is in the past.");

		expect(function() {
			DateTimeUtil.datetimeFromTime(new Date("2024-01-31 00:20"), 23 * 60);
		}).toThrowError("Time is in the past.");

		expect(function() {
			DateTimeUtil.datetimeFromTime(new Date("2024-01-31 00:20"), 22 * 60 + 21);
		}).toThrowError("Time is in the past.");
	});
});
