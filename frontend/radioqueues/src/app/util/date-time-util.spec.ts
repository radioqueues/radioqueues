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
});
