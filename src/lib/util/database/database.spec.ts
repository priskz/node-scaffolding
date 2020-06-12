import { expect } from 'chai'
import { Connection } from 'typeorm'
import { config } from '~/config'
import { database } from './'

//----- Tests -----//

describe('util/database', () => {
	describe('when connect function is called', () => {
		it('should return true', async () => {
			// Test
			const result = await database.connect(config.db)

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('when disconnect function is called', () => {
		it('should return true', async () => {
			// Test
			const result = await database.disconnect()

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('when disconnect function is called but already disconnected', () => {
		it('should return false', async () => {
			// Test
			const result = await database.disconnect()

			// Assertions
			expect(result).to.be.false
		})
	})

	describe('when connection function is called', () => {
		it('should return Connection instance', async () => {
			// Test
			const result = database.connection()

			// Assertions
			expect(result).to.be.instanceOf(Connection)
		})
	})
})
