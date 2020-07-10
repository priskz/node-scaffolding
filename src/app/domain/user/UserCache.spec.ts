import { expect } from 'chai'
import { MockUser } from '~/test/mocks'
import { User } from '~/app/domain'
import { UserCache } from '~/app/domain'

describe('src/app/domain/user/UserCache', () => {
	// Unit
	let userCache: UserCache

	// Mock User
	let mockUser: User

	before(async () => {
		// Create a mock userclear
		mockUser = await MockUser.create({ email: 'UserCache@unit-test.com' })
	})

	after(async () => {
		// Clean up
		await userCache.flush()
		await userCache.client().disconnect()
		await MockUser.destroy(mockUser.id)
	})

	describe('constructor method', () => {
		it('should create a new instance', async () => {
			// Test
			userCache = new UserCache()

			// Assertions
			userCache.should.be.an.instanceOf(UserCache)
		})
	})

	describe('getSource method', () => {
		it('should return raw data from source', async () => {
			// Test
			const result = (await userCache.getSource(mockUser.id)) as User

			// Assertions
			expect(result.id).to.equal(mockUser.id)
			expect(result.firstName).to.equal(mockUser.firstName)
			expect(result.email).to.equal(mockUser.email)
		})

		it('should return undefined if not found', async () => {
			// Test
			const result = (await userCache.getSource(0)) as User

			// Assertions
			expect(result).to.be.undefined
		})
	})

	describe('save method', () => {
		it('should set given User in cache and return true', async () => {
			// Test
			const result = await userCache.save(mockUser)

			// Assertions
			expect(result).to.be.true
		})

		it('when refresh param is true it should retrieve from source, set given User in cache, and return true', async () => {
			// Test
			const result = await userCache.save(mockUser, true)

			// Clean up
			await userCache.flush()

			// Assertions
			expect(result).to.be.true
		})

		it('when refresh param is true and id does not exist in source it should return false', async () => {
			// Mock
			const missingUser = { id: 0 } as User

			// Test
			const result = await userCache.save(missingUser, true)

			// Assertions
			expect(result).to.be.false
		})
	})

	describe('saveById method', () => {
		it('should return true if found and set in cache', async () => {
			// Test
			const result = await userCache.saveById(mockUser.id)

			// Clean up
			await userCache.flush()

			// Assertions
			expect(result).to.be.true
		})

		it('should return false if not found in source', async () => {
			// Test
			const result = await userCache.saveById(0)

			// Assertions
			expect(result).to.be.false
		})
	})

	describe('fetch method', () => {
		it('if optional param is false it should return undefined if not found in cache', async () => {
			// Test
			const result = await userCache.fetch(mockUser.id, false)

			// Assertions
			expect(result).to.be.undefined
		})

		it('if not in cache, should retrieve from source, add to cache, and return User', async () => {
			// Test
			const result = (await userCache.fetch(mockUser.id)) as User

			// Assertions
			expect(result.id).to.equal(mockUser.id)
			expect(result.firstName).to.equal(mockUser.firstName)
			expect(result.email).to.equal(mockUser.email)
		})

		it('if in cache and optional cache param is false, it should return User', async () => {
			// Test
			const result = (await userCache.fetch(mockUser.id, false)) as User

			// Assertions
			expect(result.id).to.equal(mockUser.id)
			expect(result.firstName).to.equal(mockUser.firstName)
			expect(result.email).to.equal(mockUser.email)
		})

		it('if in cache and no optional param is given it should return User', async () => {
			// Test
			const result = (await userCache.fetch(mockUser.id)) as User

			// Assertions
			expect(result.id).to.equal(mockUser.id)
			expect(result.firstName).to.equal(mockUser.firstName)
			expect(result.email).to.equal(mockUser.email)
		})

		it('if source not found should return undefined', async () => {
			// Test
			const result = (await userCache.fetch(0)) as User

			// Assertions
			expect(result).to.be.undefined
		})
	})
})
