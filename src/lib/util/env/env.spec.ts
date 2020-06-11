import { expect } from 'chai'
import { env } from './'

//----- Tests -----//

describe('util/env', () => {
	describe('when environment variable does not exist', () => {
		it('should throw an error', async () => {
			// Init
			let result

			// Test
			try {
				result = env('DOES_NOT_EXIST')
			} catch (error) {
				result = error.message
			}

			// Assertions
			expect(result).to.equal('DOES_NOT_EXIST is not defined')
		})
	})

	describe('when environment variable does not exist but a fallback is given', () => {
		it('should throw an error', async () => {
			// Fallback value
			const fallback = 'FALLBACK_VALUE'

			// Test
			const result = env('DOES_NOT_EXIST', fallback)

			// Assertions
			expect(result).to.equal(fallback)
		})
	})

	describe("when ENV has 'true' string value", () => {
		it('should return boolean true', async () => {
			// Test
			const result = env('TEST_ENV_BOOL_TRUE')

			// Assertions
			expect(result).to.be.true
		})
	})

	describe("when ENV has 'false' string value", () => {
		it('should return boolean false', async () => {
			// Test
			const result = env('TEST_ENV_BOOL_FALSE')

			// Assertions
			expect(result).to.be.false
		})
	})

	describe('when ENV has csv string value and casted as array', () => {
		it('should return an array', async () => {
			// Test
			const result1 = env('TEST_ENV_ARRAY', [], '[]')
			const result2 = env('TEST_ENV_ARRAY', [], 'array')

			// Assertions
			expect(Array.isArray(result1)).to.be.true
			expect(Array.isArray(result2)).to.be.true
		})
	})

	describe('when ENV has int value and casted as int', () => {
		it('should return an array', async () => {
			// Test
			const result = env('TEST_ENV_INT', undefined, 'int')

			// Assertions
			expect(typeof result).to.equal('number')
		})
	})
})
