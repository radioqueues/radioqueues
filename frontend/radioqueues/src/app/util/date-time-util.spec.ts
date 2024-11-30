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
		DateTimeUtil.fakeNow = new Date("2024-01-01 15:00");
		expect(DateTimeUtil.datetimeFromTime(15 * 60 + 6)).toEqual(new Date("2024-01-01 15:06"));
		DateTimeUtil.fakeNow = new Date("2024-01-01 18:00");
		expect(DateTimeUtil.datetimeFromTime(15 * 60 + 7)).toEqual(new Date("2024-01-02 15:07"));
		DateTimeUtil.fakeNow = new Date("2024-01-31 18:00");
		expect(DateTimeUtil.datetimeFromTime(15 * 60 + 8)).toEqual(new Date("2024-02-01 15:08"));
		DateTimeUtil.fakeNow = new Date("2024-01-31 23:00");
		expect(DateTimeUtil.datetimeFromTime(23 * 60 + 40)).toEqual(new Date("2024-01-31 23:40"));
		expect(DateTimeUtil.datetimeFromTime(0 *  60 + 5)).toEqual(new Date("2024-02-01 00:05"));

		expect(function() {
			DateTimeUtil.fakeNow = new Date("2024-01-31 18:00");
			DateTimeUtil.datetimeFromTime(17 * 60);
		}).toThrowError("Time is in the past.");

		expect(function() {
			DateTimeUtil.fakeNow = new Date("2024-01-31 00:20");
			DateTimeUtil.datetimeFromTime(23 * 60);
		}).toThrowError("Time is in the past.");

		expect(function() {
			DateTimeUtil.fakeNow = new Date("2024-01-31 00:20");
			DateTimeUtil.datetimeFromTime(22 * 60 + 21);
		}).toThrowError("Time is in the past.");
	});

	it('changeDateTimeToDate', () => {
		let fakeNow = new Date("2024-01-01 17:12:34");
		let someDate = new Date("2020-01-01 15:01:23");
		DateTimeUtil.changeDateTimeToDate(someDate, fakeNow);
		expect(someDate).toEqual(new Date("2024-01-01 15:01:23"));

		let pseudoDateByondEndOfTime = new Date("+099999-12-31T23:00:00.000Z");
		DateTimeUtil.changeDateTimeToDate(pseudoDateByondEndOfTime, fakeNow);
		expect(pseudoDateByondEndOfTime).toEqual(pseudoDateByondEndOfTime);
		
	});

});
