const DATE_FORMAT: Intl.DateTimeFormatOptions = {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
};

export const TimeService = {
	// To Human readable data
	formatDate(date: Date, locale = "en-US"): string {
		return date.toLocaleDateString(locale, DATE_FORMAT);
	},

	now(): Date {
		return new Date();
	},
} as const;