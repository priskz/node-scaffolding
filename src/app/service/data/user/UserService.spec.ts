import { expect } from 'chai'
import { MockUser } from '~/test/mocks'
import { User } from '~/app/domain'
import { UserService } from './'

describe('app/service/data/user/UserService', () => {
	// Unit
	let service: UserService

	// Mock User
	let mockUser: User

	before(async () => {
		// Clean up
		mockUser = await MockUser.create()
	})

	after(async () => {
		// Clean up
		await MockUser.destroy(mockUser.id)
	})

	describe('constructor method', () => {
		it('should return new instance of UserService', async () => {
			// Test
			service = new UserService()

			// Assertions
			expect(service).to.be.an.instanceOf(UserService)
		})
	})

	describe('getOneByEmail method', () => {
		it('if found should return User', async () => {
			// Test
			const result = await service.getOneByEmail(mockUser.email)

			// Assertions
			expect(result)
				.to.have.property('email')
				.to.equal(mockUser.email)
		})

		it('if NOT found should return undefined', async () => {
			// Test
			const reuslt = await service.getOneByEmail('email@doesnotexist.com')

			// Assertions
			expect(reuslt).to.be.undefined
		})
	})
})
