import { expect } from 'chai'
import { cache } from './'
import { Client } from './'

//----- Tests -----//

describe('util/cache', () => {
	describe('when connect function is called', () => {
		it('should return true', async () => {
			// Test
			const result = await cache.connect()

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('when disconnect function is called', () => {
		it('should return true', async () => {
			// Test
			const result = await cache.disconnect()

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('when disconnect function is called but already disconnected', () => {
		it('should return false', async () => {
			// Test
			const result = await cache.disconnect()

			// Assertions
			expect(result).to.be.false
		})
	})

	describe('when client function is called', () => {
		it('should return global Client instance', async () => {
			// Test
			const result = cache.client()

			// Assertions
			expect(result).to.be.instanceOf(Client)
		})
	})
})
