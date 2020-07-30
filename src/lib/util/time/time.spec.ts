import { expect } from 'chai'
import { DateTime } from 'luxon'
import { STAMP_FORMAT, time } from './'

//----- Data -----//

// Predictable date
const date = new Date('12 Feb 1991 00:00:00 UTC')

const dateObject = {
	day: date.getUTCDate(),
	year: date.getFullYear(),
	month: date.getMonth() + 1
}

//----- Tests -----//

describe('util/time', () => {
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

		it('should have time zone of UTC', async () => {
			expect(result.zoneName).to.equal('UTC')
		})
	})

	describe('format method', () => {
		it('should return instance of DateTime', async () => {
			// Format
			const format = 'y-LL-dd'

			// Test
			const result = time.format(format, dateObject)

			// Assertions
			expect(result).to.equal('1991-02-12')
		})
	})

	describe('formatLocal method', () => {
		it('should return instance of DateTime', async () => {
			// Format
			const format = 'y-LL-dd'

			// Test
			const result = time.formatLocal(format, dateObject)

			// Assertions
			expect(result).to.equal('1991-02-12')
		})
	})

	describe('from method', () => {
		it('should return predctiable instance of DateTime', async () => {
			// Test
			const result = time.from(dateObject)

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})
	})

	describe('fromLocal method', () => {
		it('should return predctiable instance of DateTime', async () => {
			// Test
			const result = time.fromLocal(dateObject)

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})
	})

	describe('iso method', () => {
		it('should return iso formatted string', async () => {
			// Test
			const result = time.iso(dateObject)

			// Assertions
			expect(result).to.equal('1991-02-12T06:00:00.000Z')
		})
	})

	describe('isoLocal method', () => {
		it('should return iso formatted string', async () => {
			// Test
			const result = time.isoLocal(dateObject)

			// Assertions
			expect(result).to.equal('1991-02-12T00:00:00.000-06:00')
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
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
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
			expect(result.hour).to.equal(6)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('ISO format should return given format', async () => {
			// Test
			const result = time.parse(
				'1991-02-12T00:00:00.000-06:00',
				'ISO'
			) as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(6)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('MYSQL format should return given format', async () => {
			// Test
			const result = time.parse('1991-02-12 00:00:00', 'MYSQL') as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(6)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('RFC2822 format should return given format', async () => {
			// Test
			const result = time.parse(
				'Tue, 12 Feb 1991 00:00:00 -0600',
				'RFC2822'
			) as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(6)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('STAMP format should return given format', async () => {
			// Test
			const result = time.parse('1991-02-12 00:00:00', 'STAMP') as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(6)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('SQL format should return given format', async () => {
			// Test
			const result = time.parse(
				'1991-02-12 00:00:00.000 -06:00',
				'SQL'
			) as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(6)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('UNIX_MS format should return given format', async () => {
			// Test
			const result = time.parse('666338400000', 'UNIX_MS') as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(6)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('UNIX_SEC format should return given format', async () => {
			// Test
			const result = time.parse('666338400', 'UNIX_SEC') as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(6)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})
	})

	describe('parseLocal method', () => {
		it('invalid date should return undefined', async () => {
			// Test
			const result = time.parseLocal(
				'Wed, 12 Feb 1991 06:00:00 GMT',
				'HTTP'
			) as DateTime

			// Assertions
			expect(result).to.be.undefined
		})

		it('FORMAT format should return given format', async () => {
			// Test
			const result = time.parseLocal(
				'1991-02-12 00:00:00',
				'FORMAT',
				STAMP_FORMAT
			) as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('FORMAT without format should return undefined', async () => {
			// Test
			const result = time.parseLocal(
				'1991-02-12 00:00:00',
				'FORMAT'
			) as DateTime

			// Assertions
			expect(result).to.be.undefined
		})

		it('HTTP format should return given format', async () => {
			// Test
			const result = time.parseLocal(
				'Tue, 12 Feb 1991 06:00:00 GMT',
				'HTTP'
			) as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('ISO format should return given format', async () => {
			// Test
			const result = time.parseLocal(
				'1991-02-12T00:00:00.000-06:00',
				'ISO'
			) as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('MYSQL format should return given format', async () => {
			// Test
			const result = time.parseLocal('1991-02-12 00:00:00', 'MYSQL') as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('RFC2822 format should return given format', async () => {
			// Test
			const result = time.parseLocal(
				'Tue, 12 Feb 1991 00:00:00 -0600',
				'RFC2822'
			) as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('STAMP format should return given format', async () => {
			// Test
			const result = time.parseLocal('1991-02-12 00:00:00', 'STAMP') as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('SQL format should return given format', async () => {
			// Test
			const result = time.parseLocal(
				'1991-02-12 00:00:00.000 -06:00',
				'SQL'
			) as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('UNIX_MS format should return given format', async () => {
			// Test
			const result = time.parseLocal('666338400000', 'UNIX_MS') as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})

		it('UNIX_SEC format should return given format', async () => {
			// Test
			const result = time.parseLocal('666338400', 'UNIX_SEC') as DateTime

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.hour).to.equal(0)
			expect(result.minute).to.equal(0)
			expect(result.second).to.equal(0)
			expect(result.day).to.equal(dateObject.day)
			expect(result.month).to.equal(dateObject.month)
			expect(result.year).to.equal(dateObject.year)
		})
	})

	describe('stamp method', () => {
		it('should return timpestamp string', async () => {
			// Test
			const result = time.stamp(dateObject)

			// Assertions
			expect(result).to.equal('1991-02-12 06:00:00')
		})
	})

	describe('stampLocal method', () => {
		it('should return timpestamp string', async () => {
			// Test
			const result = time.stampLocal(dateObject)

			// Assertions
			expect(result).to.equal('1991-02-12 00:00:00')
		})
	})

	describe('utc method', () => {
		it('should return utc formatted string', async () => {
			// Test
			const result = time.utc(dateObject)

			// Assertions
			expect(result).to.be.an.instanceOf(DateTime)
			expect(result.zoneName).to.equal('UTC')
		})
	})
})
