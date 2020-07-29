import { expect } from 'chai'
import { DateTime } from 'luxon'
import { DEFAULT_TIMEZONE, STAMP_FORMAT, time } from './'

//----- Data -----//

// Predictable date
const date = { day: 12, month: 2, year: 1991 }

//----- Tests -----//

describe('util/time', () => {
	describe('format method', () => {
		it('should return instance of DateTime', async () => {
			// Format
			const format = 'y-LL-dd'

			// Test
			const result = time.format(format, date)

			// Assertions
			expect(result).to.equal('1991-02-12')
		})
	})

	describe('from method', () => {
		it('should return predctiable instance of DateTime', async () => {
			// Test
			const result = time.from(date)

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.day).to.equal(date.day)
			expect(result.month).to.equal(date.month)
			expect(result.year).to.equal(date.year)
		})
	})

	describe('iso method', () => {
		it('should return iso formatted string', async () => {
			// Test
			const result = time.iso(date)

			// Assertions
			expect(result).to.equal('1991-02-12T00:00:00.000-06:00')
		})
	})

	describe('local method', () => {
		it('should return instance of DateTime', async () => {
			// Test
			const result = time.local()

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
		})
	})

	describe('now method', () => {
		// Test
		const result = time.now()

		it('should return instance of DateTime', async () => {
			expect(result).to.be.an.instanceOf(DateTime)
		})

		it('should have time zone of America/Chicago', async () => {
			expect(result.zoneName).to.equal(DEFAULT_TIMEZONE)
		})

		it('given a new time zone, it should return with that zone', async () => {
			// New Zone
			const newTimeZone = 'America/Los_Angeles'

			// Test
			const result = time.now({ zone: newTimeZone })

			// Assertions
			expect(result.zoneName).to.equal(newTimeZone)
		})
	})

	describe('parse method', () => {
		it('invalid date should return undefined', async () => {
			// Test
			const result = time.parse(
				'Wed, 12 Feb 1991 06:00:00 GMT',
				'HTTP'
			) as DateTime

			// Assertions
			expect(result).to.be.undefined
		})

		it('FORMAT format should return given format', async () => {
			// Test
			const result = time.parse(
				'1991-02-12 00:00:00',
				'FORMAT',
				STAMP_FORMAT
			) as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.day).to.equal(date.day)
			expect(result.month).to.equal(date.month)
			expect(result.year).to.equal(date.year)
		})

		it('FORMAT without format should return undefined', async () => {
			// Test
			const result = time.parse('1991-02-12 00:00:00', 'FORMAT') as DateTime

			// Assertions
			expect(result).to.be.undefined
		})

		it('HTTP format should return given format', async () => {
			// Test
			const result = time.parse(
				'Tue, 12 Feb 1991 06:00:00 GMT',
				'HTTP'
			) as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(date.day)
			expect(result.month).to.equal(date.month)
			expect(result.year).to.equal(date.year)
		})

		it('ISO format should return given format', async () => {
			// Test
			const result = time.parse(
				'1991-02-12T00:00:00.000-06:00',
				'ISO'
			) as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(date.day)
			expect(result.month).to.equal(date.month)
			expect(result.year).to.equal(date.year)
		})

		it('RFC2822 format should return given format', async () => {
			// Test
			const result = time.parse(
				'Tue, 12 Feb 1991 00:00:00 -0600',
				'RFC2822'
			) as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(date.day)
			expect(result.month).to.equal(date.month)
			expect(result.year).to.equal(date.year)
		})

		it('SQL format should return given format', async () => {
			// Test
			const result = time.parse(
				'1991-02-12 00:00:00.000 -06:00',
				'SQL'
			) as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(date.day)
			expect(result.month).to.equal(date.month)
			expect(result.year).to.equal(date.year)
		})

		it('UNIX_MS format should return given format', async () => {
			// Test
			const result = time.parse('666338400000', 'UNIX_MS') as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(date.day)
			expect(result.month).to.equal(date.month)
			expect(result.year).to.equal(date.year)
		})

		it('UNIX_SEC format should return given format', async () => {
			// Test
			const result = time.parse('666338400', 'UNIX_SEC') as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(date.day)
			expect(result.month).to.equal(date.month)
			expect(result.year).to.equal(date.year)
		})
	})

	describe('stamp method', () => {
		it('should return timpestamp string', async () => {
			// Test
			const result = time.stamp(date)

			// Assertions
			expect(result).to.equal('1991-02-12 00:00:00')
		})
	})

	describe('utc method', () => {
		it('should return utc formatted string', async () => {
			// Test
			const result = time.utc()

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.zoneName).to.equal('UTC')
		})
	})
})

// const test6 = time.parse('1996-12-12T12:12:12').format('YYYY-MM-DD HH:mm:ss')
// console.log('test6:', test6)
