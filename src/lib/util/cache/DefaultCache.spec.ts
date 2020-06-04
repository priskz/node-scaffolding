import { expect } from 'chai'
import { Client } from './'
import { DefaultCache } from './'

//----- Tests -----//

describe('src/util/cache/DefaultCache', () => {
	// Test Subject
	let defaultCache: DefaultCache

	// Simple test object
	const simpleObject: SimpleObject = {
		id:
			'test-' +
			Math.random()
				.toString(36)
				.substring(2, 15),
		firstName: 'Aaron',
		lastName: 'Rodgers'
	}

	after(async () => {
		// Disconnect client if isn't already
		await defaultCache.client().disconnect()
	})

	describe('constructor method', () => {
		it('should create a new instance', () => {
			// Test
			defaultCache = new DefaultCache()

			// Assertions
			defaultCache.should.be.an.instanceOf(DefaultCache)
		})
	})

	describe('client method', () => {
		it('should return instance of Client', async () => {
			// Test
			const result = defaultCache.client()

			// Assertions
			result.should.be.an.instanceOf(Client)
		})
	})

	describe('set && get methods', () => {
		it('should set && get value in cache for the key provided', async () => {
			// Add to cache
			await defaultCache.set(simpleObject.id, simpleObject)

			// Test
			const result = await defaultCache.get<SimpleObject>(simpleObject.id)

			// Assertions
			expect(result).to.be.like(simpleObject)
		})
	})

	describe('getRaw method', () => {
		it('should set && get value in cache for the key provided', async () => {
			// Test
			const result = await defaultCache.getRaw(simpleObject.id)

			// Assertions
			expect(result).to.not.be.like(simpleObject)
			expect(result).to.equal(JSON.stringify(simpleObject))
		})
	})

	describe('remove method', () => {
		it('should set && get value in cache for the key provided', async () => {
			// Test
			const result = await defaultCache.remove(simpleObject.id)

			// Assertions
			result.should.be.true
		})
	})

	describe('setTtl && getTtl methods', () => {
		it('should set/get ttl property to value given', async () => {
			// Test value
			const ttl = 100

			// Set value
			defaultCache.setTtl(ttl)

			// Test
			const result = defaultCache.getTtl()

			// Assertions
			result.should.equal(ttl)
		})
	})

	describe('setBucket && getBucket methods', () => {
		it('should set/get bucket property to value given', async () => {
			// Test value
			const bucket = 8

			// Set value
			defaultCache.setBucket(bucket)

			// Test
			const result = defaultCache.getBucket()

			// Assertions
			result.should.equal(bucket)
		})
	})

	describe('parseKey method', () => {
		it('should return predictably formatted cache key', async () => {
			// Test value
			const key = 1

			// Test
			const result = defaultCache.parseKey(key)

			// Assertions
			result.should.equal('1')
		})
	})

	describe('setPrefix && getPrefix methods', () => {
		it('should set/get bucket property to value given', async () => {
			// Test value
			const prefix = 'unit-test'

			// Set value
			defaultCache.setPrefix(prefix)

			// Test
			const result = defaultCache.getPrefix()

			// Assertions
			result.should.equal(prefix)
		})
	})
})

interface SimpleObject {
	id: string
	firstName: string
	lastName: string
}
