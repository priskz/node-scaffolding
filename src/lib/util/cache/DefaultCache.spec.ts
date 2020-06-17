import { expect } from 'chai'
import { Client } from './'
import { DefaultCache } from './'

//----- Tests -----//

describe('src/lib/util/cache/DefaultCache', () => {
	// Test Subject
	let defaultCache: DefaultCache

	// Test bucket
	const testBucket = 13

	// Test Prefix
	const testPrefix = 'unit-test'

	// Test time to live
	const testTtl = 100

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
		// Clean up
		await defaultCache.client().dumpBucket()

		// Disconnect client if isn't already
		await defaultCache.client().disconnect()
	})

	describe('constructor method', async () => {
		it('should create a new instance', async () => {
			// Test
			defaultCache = new DefaultCache()

			// Assertions
			expect(defaultCache).to.be.an.instanceOf(DefaultCache)
		})
	})

	describe('constructor method is given optional config param', async () => {
		it('should create a new instance', async () => {
			// Test
			const testDefaultCache = new DefaultCache({
				client: new Client({ port: 8080 }),
				bucket: 4,
				prefix: 'optional-test-key',
				ttl: 24
			})

			// Clean up
			await testDefaultCache.client().disconnect()

			// Assertions
			expect(testDefaultCache).to.be.an.instanceOf(DefaultCache)
		})
	})

	describe('client method', () => {
		it('should return instance of Client', async () => {
			// Test
			const result = defaultCache.client()

			// Assertions
			expect(result).to.be.an.instanceOf(Client)
		})
	})

	describe('setBucket && getBucket methods', () => {
		it('should set/get bucket property to value given', async () => {
			// Set value
			defaultCache.setBucket(testBucket)

			// Test
			const result = defaultCache.getBucket()

			// Assertions
			expect(result).to.equal(testBucket)
		})
	})

	describe('setPrefix && getPrefix methods', () => {
		it('should set/get bucket property to value given', async () => {
			// Set value
			defaultCache.setPrefix(testPrefix)

			// Test
			const result = defaultCache.getPrefix()

			// Assertions
			expect(result).to.equal(testPrefix)
		})
	})

	describe('setTtl && getTtl methods', () => {
		it('should set/get ttl property to value given', async () => {
			// Set value
			defaultCache.setTtl(testTtl)

			// Test
			const result = defaultCache.getTtl()

			// Assertions
			expect(result).to.equal(testTtl)
		})
	})

	describe('parseKey method', () => {
		it('should return predictably formatted cache key', async () => {
			// Test value
			const key = 12345

			// Test
			const result = defaultCache.parseKey(key)

			// Assertions
			expect(result).to.equal(`${testPrefix}:${key}`)
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

	describe('get method throws invalid JSON error', () => {
		it('should return null', async () => {
			// Test data
			const data = {
				key: 'invalid-json-test',
				value: '{test: value,}'
			}

			// Add to cache
			await defaultCache.set(data.key, data.value)

			// Test
			const result1 = await defaultCache.get<SimpleObject>(data.key)

			// Clean up
			const result2 = await defaultCache.remove(data.key)

			// Assertions
			expect(result1).to.be.null
			expect(result2).to.be.true
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
			expect(result).to.be.true
		})
	})

	describe('keys method', () => {
		it('should return all keys by default with given prefix and pattern', async () => {
			// Test Data
			const data = [
				{
					id:
						'test-' +
						Math.random()
							.toString(36)
							.substring(2, 15),
					firstName: 'keys',
					lastName: 'test'
				},
				{
					id:
						'test-' +
						Math.random()
							.toString(36)
							.substring(2, 15),
					firstName: 'keys',
					lastName: 'test'
				}
			]

			// Add data
			await defaultCache.set('1', data[0])
			await defaultCache.set('2', data[1])

			// Test
			const result1 = await defaultCache.keys()
			const result2 = await defaultCache.get<SimpleObject>('1')
			const result3 = await defaultCache.get<SimpleObject>('2')

			// Assertions
			expect(result1.length).to.equal(data.length)
			expect(result2)
				.to.have.property('id')
				.equal(data[0].id)
			expect(result3)
				.to.have.property('id')
				.equal(data[1].id)
		})
	})

	describe('flush method', () => {
		it('should remove all key-value-pairs based on prefix & bucket property', async () => {
			// Set prefix for this test
			defaultCache.setPrefix('FLUSHTEST')

			// Add data
			await defaultCache.set('1', 'FLUSHTESTVALUE1')
			await defaultCache.set('2', 'FLUSHTESTVALUE2')

			// Count keys pre test
			const result1 = await defaultCache.keys()

			// Test
			const result2 = await defaultCache.flush()

			// Count keys post test
			const result3 = await defaultCache.keys()

			// Assertions
			expect(result1.length).to.equal(2)
			expect(result2).to.be.true
			expect(result3.length).to.equal(0)
		})
	})

	describe('flush method w/optional pattern', () => {
		it('should remove all key-value-pairs based on pattern given', async () => {
			// Set prefix for this test
			defaultCache.setPrefix('PATTERNTEST')

			// Add data
			await defaultCache.set('1', 'PATTERNTEST1')
			await defaultCache.set('2', 'PATTERNTEST2')

			// Count keys pre test
			const result1 = await defaultCache.keys()

			// Test
			const result2 = await defaultCache.flush('*PATTERNTEST*')

			// Count keys post test
			const result3 = await defaultCache.keys()

			// Assertions
			expect(result1.length).to.equal(2)
			expect(result2).to.be.true
			expect(result3.length).to.equal(0)
		})
	})
})

interface SimpleObject {
	id: string
	firstName: string
	lastName: string
}
