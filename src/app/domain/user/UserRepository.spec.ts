import { expect } from 'chai'
import { UserRepository } from '.'

describe('app/domain/user/UserRepository', () => {
	// Unit
	let repository: UserRepository

	describe('constructor method', () => {
		it('should return new instance of UserRepository', async () => {
			// Test
			repository = new UserRepository()

			// Assertions
			expect(repository).to.be.an.instanceOf(UserRepository)
		})
	})
})
