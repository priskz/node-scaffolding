import { DateObject, DateTime } from 'luxon'

/*
 * Default Stamp Format
 * MySql Timestamp: y-LL-dd HH:mm:ss === 2020-07-28 20:16:24
 */
export const STAMP_FORMAT = 'y-LL-dd HH:mm:ss'

/*
 * Default Timezone
 */
export const DEFAULT_TIMEZONE = 'America/Chicago'

/*
 * Get current time in format provided
 * see: https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
 */
function format(format: string, config?: DateObject): string {
	return now(config).toFormat(format)
}

/*
 * Get current time object
 */
function from(config: DateObject): DateTime {
	return DateTime.fromObject({
		zone: DEFAULT_TIMEZONE,
		...config
	})
}

/*
 * Get current iso time string
 */
function iso(config?: DateObject): string {
	return now(config).toISO()
}

/*
 * Get machine time object
 */
function local(): DateTime {
	return DateTime.local()
}

/*
 * Get current time object
 */
function now(config?: DateObject): DateTime {
	return DateTime.fromObject({
		zone: DEFAULT_TIMEZONE,
		...config
	})
}

/*
 * Get current timestamp string
 */
function stamp(config?: DateObject): string {
	return now(config).toFormat(STAMP_FORMAT)
}

/*
 * Get current utc time object
 */
function utc(config?: DateObject): DateTime {
	return now(config).toUTC()
}

/*
 * Parse value into time object
 * See: https://moment.github.io/luxon/docs/manual/parsing.html
 */
function parse(
	value: string,
	from: ParseFrom,
	format?: string
): DateTime | undefined {
	// Init
	let time

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

		case 'UNIX_MS':
			// Attmept to parse
			time = DateTime.fromMillis(parseInt(value))
			break

		case 'UNIX_SEC':
			// Attmept to parse
			time = DateTime.fromSeconds(parseInt(value))
			break
	}

	// Only return if set and it is valid
	if (time && time.isValid) return time
}

/*
 * Export Util
 */
export const time: Time = {
	from,
	format,
	iso,
	local,
	now,
	parse,
	stamp,
	utc
}

interface Time {
	from: (config: DateObject) => DateTime
	format: (format: string, config?: DateObject) => string
	iso: (config?: DateObject) => string
	local: () => DateTime
	now: (config?: DateObject) => DateTime
	parse: (
		value: string,
		from: ParseFrom,
		format?: string
	) => DateTime | undefined
	stamp: (config?: DateObject) => string
	utc: (config?: DateObject) => DateTime
}

type ParseFrom =
	| 'FORMAT'
	| 'HTTP'
	| 'ISO'
	| 'RFC2822'
	| 'SQL'
	| 'UNIX_MS'
	| 'UNIX_SEC'
