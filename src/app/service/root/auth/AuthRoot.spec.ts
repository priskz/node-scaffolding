import { expect } from 'chai'
import { MockUser } from '~/test/mocks'
import { User } from '~/app/domain'
import { AuthRoot } from './'

describe('app/service/root/auth/AuthRoot', () => {
	// Unit
	let service: AuthRoot

	// Mock user data
	let userData = MockUser.getPrimaryMockUserData()

	// Mock User
	let mockUser: User

	after(async () => {
		// Clean up
		await MockUser.destroy(mockUser.id)
	})

	describe('constructor method', () => {
		it('should return new instance of AuthRoot', async () => {
			// Test
			service = new AuthRoot()

			// Assertions
			expect(service).to.be.an.instanceOf(AuthRoot)
		})
	})

	describe('register method', () => {
		it('valid data should return new User', async () => {
			// Test
			mockUser = (await service.register(userData)) as User

			// Assertions
			expect(mockUser).to.have.property('id')
			expect(mockUser).to.have.property('createdAt').not.null
			expect(mockUser).to.include.keys(Object.keys(userData))
			expect(mockUser)
				.to.have.property('password')
				.not.equal(userData.password)
		})

		it('email exists should throw', async () => {
			// Assertion
			expect(async function() {
				await service.register(userData)
			}).to.throw
		})
	})

	describe('login method', () => {
		it('valid credentials should return new User', async () => {
			// Test
			const result = await service.login(userData.email, userData.password)

			// Assertions
			expect(result)
				.to.have.property('id')
				.equal(mockUser.id)
			expect(result).to.include.keys(Object.keys(userData))
		})

		it('invalid credentials should return undefined', async () => {
			// Test
			const result = await service.login(userData.email, 'wrongpass')

			// Assertions
			expect(result).to.be.undefined
		})
	})

	describe('logout method', () => {
		it.skip('should expire active session', async () => {
			//
		})
	})
})
