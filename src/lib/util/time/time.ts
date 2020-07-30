import { DateObject, DateTime } from 'luxon'

/*
 * Default Stamp Format
 * MySql Timestamp: y-LL-dd HH:mm:ss === 2020-07-28 20:16:24
 */
export const STAMP_FORMAT = 'y-LL-dd HH:mm:ss'

/*
 * UTC Timezone
 */
export const LOCAL_TIMEZONE = 'America/Chicago'

/*
 * Get current UTC time object
 */
function now(config?: DateObject): DateTime {
	return DateTime.fromObject({
		...config
	}).toUTC()
}

/*
 * Get current Local time object
 */
function local(config?: DateObject): DateTime {
	return DateTime.fromObject({
		...config
	})
		.toLocal()
		.setZone(LOCAL_TIMEZONE)
}

/*
 * Get current time string in format provided
 * see: https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
 */
function format(format: string, config?: DateObject): string {
	return now(config).toFormat(format)
}

/*
 * Get current time string in format provided
 * see: https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
 */
function formatLocal(format: string, config?: DateObject): string {
	return local(config).toFormat(format)
}

/*
 * Get time from config object
 */
function from(config: DateObject): DateTime {
	return DateTime.fromObject({
		...config
	}).toUTC()
}

/*
 * Get time from config object with local offset
 */
function fromLocal(config: DateObject): DateTime {
	return DateTime.fromObject({
		...config
	})
		.toLocal()
		.setZone(LOCAL_TIMEZONE)
}

/*
 * Get current iso time string
 */
function iso(config?: DateObject): string {
	return now(config).toISO()
}

/*
 * Get current iso time string with local offset
 */
function isoLocal(config?: DateObject): string {
	return local(config).toISO()
}

/*
 * Get current timestamp string
 */
function stamp(config?: DateObject): string {
	return now(config).toFormat(STAMP_FORMAT)
}

/*
 * Get current timestamp string with local offset
 */
function stampLocal(config?: DateObject): string {
	return local(config).toFormat(STAMP_FORMAT)
}

/*
 * Get current UTC time object
 */
function utc(config?: DateObject): DateTime {
	return now(config)
}

/*
 * Parse value into time object
 * See: https://moment.github.io/luxon/docs/manual/parsing.html
 */
function parse(
	value: string | Date,
	from?: ParseFrom,
	format?: string
): DateTime | undefined {
	// Init
	let time

	// String Value
	if (typeof value === 'string') {
		// Different from types need different logic
		switch (from) {
			case 'FORMAT':
				// Needs format
				if (!format) return

				// Attempt to parse
				time = DateTime.fromFormat(value, format)
				break

			case 'HTTP':
				// Attmept to parse
				time = DateTime.fromHTTP(value)
				break

			case 'ISO':
				// Attmept to parse
				time = DateTime.fromISO(value)
				break

			case 'RFC2822':
				// Attmept to parse
				time = DateTime.fromRFC2822(value)
				break

			case 'SQL':
				// Attmept to parse
				time = DateTime.fromSQL(value)
				break

			case 'MYSQL':
				// Attmept to parse
				time = DateTime.fromFormat(value, 'y-LL-dd HH:mm:ss')
				break

			case 'STAMP':
				// Attmept to parse
				time = DateTime.fromFormat(value, STAMP_FORMAT)
				break

			case 'UNIX_MS':
				// Attmept to parse
				time = DateTime.fromMillis(parseInt(value))
				break

			case 'UNIX_SEC':
				// Attmept to parse
				time = DateTime.fromSeconds(parseInt(value))
				break
		}
	} else {
		// Attmept to parse date
		time = DateTime.fromJSDate(value)
	}

	// Only return if set and it is valid
	if (time && time.isValid) return time.toUTC()
}

/*
 * Parse value into time object
 * See: https://moment.github.io/luxon/docs/manual/parsing.html
 */
function parseLocal(
	value: string | Date,
	from?: ParseFrom,
	format?: string
): DateTime | undefined {
	// Use regular parse
	const time = parse(value, from, format)

	// If parsed, convert to UTC to local
	if (time) return time.toLocal().setZone(LOCAL_TIMEZONE)
}
/*
 * Export Util
 */
export const time: Time = {
	now,
	local,
	from,
	fromLocal,
	format,
	formatLocal,
	iso,
	isoLocal,
	parse,
	parseLocal,
	stamp,
	stampLocal,
	utc
}

interface Time {
	now: (config?: DateObject) => DateTime
	local: (config?: DateObject) => DateTime
	from: (config: DateObject) => DateTime
	fromLocal: (config: DateObject) => DateTime
	format: (format: string, config?: DateObject) => string
	formatLocal: (format: string, config?: DateObject) => string
	iso: (config?: DateObject) => string
	isoLocal: (config?: DateObject) => string
	parse: (
		value: string | Date,
		from?: ParseFrom,
		format?: string
	) => DateTime | undefined
	parseLocal: (
		value: string | Date,
		from?: ParseFrom,
		format?: string
	) => DateTime | undefined
	stamp: (config?: DateObject) => string
	stampLocal: (config?: DateObject) => string
	utc: (config?: DateObject) => DateTime
}

type ParseFrom =
	| 'DATE'
	| 'FORMAT'
	| 'HTTP'
	| 'ISO'
	| 'MYSQL'
	| 'RFC2822'
	| 'STAMP'
	| 'SQL'
	| 'UNIX_MS'
	| 'UNIX_SEC'
