import { expect } from 'chai'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from './'

describe('app/domain/user/UserRepository', () => {
	// Unit
	let repository: UserRepository

	describe('constructor method', () => {
		it('should return new instance of UserRepository', async () => {
			// Test
			repository = getCustomRepository(UserRepository)

			// Assertions
			expect(repository).to.be.an.instanceOf(UserRepository)
		})
	})
})
