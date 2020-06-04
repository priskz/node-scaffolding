import { cache } from './'
import { Client } from './'

//----- Tests -----//

describe('util/cache', () => {
	describe('when connect function is called', () => {
		it('should return true', async () => {
			// Test
			const result = await cache.connect()

			// Assertions
			result.should.be.true
		})
	})

	describe('when disconnect function is called', () => {
		it('should return true', async () => {
			// Test
			const result = await cache.disconnect()

			// Assertions
			result.should.be.true
		})
	})

	describe('when client function is called', () => {
		it('should return global Client instance', async () => {
			// Test
			const result = cache.client()

			// Assertions
			result.should.be.instanceOf(Client)
		})
	})
})
