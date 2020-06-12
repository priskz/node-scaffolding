import { expect } from 'chai'
import { crypt } from './'

//----- Tests -----//

describe('util/crypt', () => {
	describe('when crypt.hash.make is given a string', () => {
		it('should return a hashed string value', async () => {
			// Test Value
			const testPassword = 'SomeSecretValue'

			// Test
			const result = await crypt.hash.make(testPassword)

			// Assertions
			expect(result.length).to.equal(60)
		})
	})

	describe('when crypt.hash.check is given valid input', () => {
		it('should return true', async () => {
			// Test Value
			const testPassword = 'SomeSecretValue'

			// Create a hash
			const hash = await crypt.hash.make(testPassword)

			// Test
			const result = await crypt.hash.check(testPassword, hash)

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('when crypt.hash.check is given invalid input', () => {
		it('should return false', async () => {
			// Test Value
			const testPassword = 'SomeSecretValue'

			// Create a hash
			const hash = await crypt.hash.make(testPassword)

			// Test
			const result = await crypt.hash.check('InvalidValue', hash)

			// Assertions
			expect(result).to.be.false
		})
	})
})
