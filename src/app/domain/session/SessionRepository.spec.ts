import { expect } from 'chai'
import { SessionRepository } from './'

describe('app/domain/session/SessionRepository', () => {
	// Unit
	let repository: SessionRepository

	describe('constructor method', () => {
		it('should return new instance of SessionRepository', async () => {
			// Test
			repository = new SessionRepository()

			// Assertions
			expect(repository).to.be.an.instanceOf(SessionRepository)
		})
	})
})
