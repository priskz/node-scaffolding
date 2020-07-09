import { expect } from 'chai'
import { MockSession, MockUser } from '~/test/mocks'
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
			mockUser = (await service.register({
				...userData,
				pass: userData.password
			})) as User

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
				await service.register({
					...userData,
					pass: userData.password
				})
			}).to.throw
		})
	})

	describe('login method', () => {
		it('valid credentials should return updated Session', async () => {
			// Create mock
			const mockSession = await MockSession.create()

			// Test
			const result = await service.login(
				mockSession,
				userData.email,
				userData.password
			)

			// Clean up
			await MockSession.destroy(mockSession)

			// Assertions
			expect(result)
				.to.have.property('userId')
				.equal(mockUser.id)
		})

		it('invalid credentials should return undefined', async () => {
			// Create mock
			const mockSession = await MockSession.create()

			// Test
			const result = await service.login(
				mockSession,
				userData.email,
				'wrongpass'
			)

			// Clean up
			await MockSession.destroy(mockSession)

			// Assertions
			expect(result).to.be.undefined
		})
	})

	describe('logout method', () => {
		it('should expire active session', async () => {
			// Create mock
			const mockSession = await MockSession.create({ userId: mockUser.id })

			// Test
			const result = await service.logout(mockSession)

			// Clean up
			await MockSession.destroy(mockSession)

			// Assertions
			expect(result).to.be.true
		})
	})
})
