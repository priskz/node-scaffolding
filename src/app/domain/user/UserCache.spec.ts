import { expect } from 'chai'
import { MockUser } from '~/test/mocks'
import { User } from '~/app/domain'
import { UserCache } from '~/app/domain'

describe('src/app/domain/user/UserCache', () => {
	// Test Subject
	let userCache: UserCache

	// Mock User
	let mockUser: User

	before(async () => {
		// Create a mock userclear
		mockUser = await MockUser.create({ email: 'UserCache@unit-test.com' })
	})

	after(async () => {
		// Clean up
		await userCache.client().remove(userCache.parseKey(mockUser.id))
		await userCache.client().disconnect()
		await MockUser.destroy(mockUser)
	})

	describe('constructor method', () => {
		it('should create a new instance', async () => {
			// Test
			userCache = new UserCache()

			// Assertions
			userCache.should.be.an.instanceOf(UserCache)
		})
	})

	describe('saveById && fetch methods', () => {
		it('should add to cache by id and return cached data value', async () => {
			// Add to cache
			await userCache.saveById(mockUser.id)

			// Test
			const result = (await userCache.fetch(mockUser.id)) as User

			// Clean Up
			await userCache.client().remove(userCache.parseKey(mockUser.id))

			// Assertions
			expect(result.email).to.be.equal(mockUser.email)
			expect(result.firstName).to.be.equal(mockUser.firstName)
			expect(result.lastName).to.be.equal(mockUser.lastName)
			expect(result.country).to.be.equal(mockUser.country)
		})
	})

	describe('fetch method on uncached resource', () => {
		it('should add to cache by id and return cached data value', async () => {
			// Cache Key
			const key = userCache.parseKey(mockUser.id)

			// Test 1: Check cache for value
			const result1 = await userCache.client().get(key)

			// Now add to cache
			await userCache.saveById(mockUser.id)

			// Test2: Add to cache while fetching
			const result2 = (await userCache.fetch(mockUser.id)) as User

			// Clean Up
			await userCache.client().remove(key)

			// Assertions
			expect(result1).to.be.null
			expect(result2.email).to.be.equal(mockUser.email)
			expect(result2.firstName).to.be.equal(mockUser.firstName)
			expect(result2.lastName).to.be.equal(mockUser.lastName)
			expect(result2.country).to.be.equal(mockUser.country)
		})
	})

	describe('save method', () => {
		it('should add given model to cache', async () => {
			// Add to cache
			await userCache.save(mockUser)

			// Cache key
			const key = userCache.parseKey(mockUser.id)

			// Test
			const result = await userCache.fetch(mockUser.id, false)

			// Clean Up
			await userCache.client().remove(key)

			// Assertions
			expect(result).to.not.be.undefined
		})
	})

	describe('getSource method', () => {
		it('should return raw source value from database', async () => {
			// Test
			const result = await userCache.getSource(mockUser.id)

			// Assertions
			expect(result).to.not.be.undefined
		})
	})
})
