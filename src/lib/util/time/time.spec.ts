import { describe, it, expect } from 'vitest'
import { time, STAMP_FORMAT, LOCAL_TIMEZONE } from './time'

describe('lib/util/time', () =>
{
	describe('constants', () =>
	{
		it('should expose the MySQL stamp format', () =>
		{
			expect(STAMP_FORMAT).toBe('y-LL-dd HH:mm:ss')
		})

		it('should expose the local timezone', () =>
		{
			expect(LOCAL_TIMEZONE).toBe('America/Chicago')
		})
	})

	describe('now / utc', () =>
	{
		it('should return a UTC DateTime from now()', () =>
		{
			const dt = time.now()
			expect(dt.isValid).toBe(true)
			expect(dt.zoneName).toBe('UTC')
		})

		it('utc() should alias now()', () =>
		{
			const dt = time.utc()
			expect(dt.zoneName).toBe('UTC')
		})
	})

	describe('local', () =>
	{
		it('should return a DateTime in the local timezone', () =>
		{
			const dt = time.local()
			expect(dt.isValid).toBe(true)
			expect(dt.zoneName).toBe(LOCAL_TIMEZONE)
		})
	})

	describe('format / stamp', () =>
	{
		it('format() should render using the given token string', () =>
		{
			const out = time.format('yyyy', { year: 2030 })
			expect(out).toBe('2030')
		})

		it('stamp() should use the MySQL stamp format', () =>
		{
			// Note: time.now() converts from system-local to UTC, so we only assert shape.
			const out = time.stamp()
			expect(out).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
		})
	})

	describe('iso', () =>
	{
		it('should produce an ISO 8601 string in UTC', () =>
		{
			const out = time.iso({ year: 2030, month: 1, day: 2 })
			expect(out).toMatch(/^2030-01-02T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
		})
	})

	describe('parse', () =>
	{
		it('should parse an ISO string', () =>
		{
			const dt = time.parse('2030-01-02T03:04:05.000Z', 'ISO')
			expect(dt?.isValid).toBe(true)
			expect(dt?.toUTC().year).toBe(2030)
		})

		it('should parse a stamp-format string', () =>
		{
			const dt = time.parse('2030-01-02 03:04:05', 'STAMP')
			expect(dt?.isValid).toBe(true)
			expect(dt?.year).toBe(2030)
		})

		it('should parse a Date object', () =>
		{
			const input = new Date('2030-01-02T00:00:00Z')
			const dt = time.parse(input)
			expect(dt?.isValid).toBe(true)
			expect(dt?.toUTC().year).toBe(2030)
		})

		it('should return undefined for an invalid string with no from-type', () =>
		{
			const dt = time.parse('not-a-date')
			expect(dt).toBeUndefined()
		})

		it('should require a format when from=FORMAT', () =>
		{
			const dt = time.parse('01/02/2030', 'FORMAT')
			expect(dt).toBeUndefined()
		})

		it('should parse with an explicit format', () =>
		{
			const dt = time.parse('01/02/2030', 'FORMAT', 'LL/dd/yyyy')
			expect(dt?.isValid).toBe(true)
			expect(dt?.toUTC().year).toBe(2030)
		})
	})

	describe('parseLocal', () =>
	{
		it('should return a DateTime in the local timezone for valid input', () =>
		{
			const dt = time.parseLocal('2030-01-02T03:04:05.000Z', 'ISO')
			expect(dt?.zoneName).toBe(LOCAL_TIMEZONE)
		})

		it('should return undefined for invalid input', () =>
		{
			const dt = time.parseLocal('nope')
			expect(dt).toBeUndefined()
		})
	})

	describe('from / fromLocal', () =>
	{
		it('from() should produce a UTC DateTime', () =>
		{
			const dt = time.from({ year: 2030, month: 6, day: 15 })
			expect(dt.zoneName).toBe('UTC')
		})

		it('fromLocal() should produce a DateTime in the local timezone', () =>
		{
			const dt = time.fromLocal({ year: 2030, month: 6, day: 15 })
			expect(dt.zoneName).toBe(LOCAL_TIMEZONE)
		})
	})
})
