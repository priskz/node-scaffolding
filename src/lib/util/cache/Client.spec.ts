import { expect } from 'chai'
import { Client } from './'

//----- Tests -----//

describe('src/lib/util/cache/Client', () => {
	// Retrieve env config vars
	const {
		REDIS_CACHE_HOST,
		REDIS_CACHE_PORT,
		REDIS_CACHE_DB_DEFAULT
	} = process.env

	if (!REDIS_CACHE_HOST || !REDIS_CACHE_PORT || !REDIS_CACHE_DB_DEFAULT) {
		throw new Error('Cache misconfiguration')
	}

	// Client Options
	const config = {
		host: REDIS_CACHE_HOST,
		port: parseInt(REDIS_CACHE_PORT),
		db: parseInt(REDIS_CACHE_DB_DEFAULT)
	}

	// Test Subject
	let client: Client

	// Cache DBs to use for testing
	const testBucket1 = 14
	const testBucket2 = 15

	// Single KeyValuePair
	const singlePair: KeyValuePair = {
		key:
			'test-' +
			Math.random()
				.toString(36)
				.substring(2, 15),
		data: 'unit-test-data'
	}

	// Mulitple KeyValuePair(s)
	const multiplePairs: KeyValuePair[] = [
		{
			key:
				'test-' +
				Math.random()
					.toString(36)
					.substring(2, 15),
			data: 'unit-test-data-1'
		},
		{
			key:
				'test-' +
				Math.random()
					.toString(36)
					.substring(2, 15),
			data: 'unit-test-data-2'
		},
		{
			key:
				'test-' +
				Math.random()
					.toString(36)
					.substring(2, 15),
			data: 'unit-test-data-3'
		}
	]

	after(async () => {
		// Disconnect client if isn't already
		await client.disconnect()
	})

	describe('constructor method', () => {
		it('should create a new instance', async () => {
			// Test
			client = new Client({ ...config, db: testBucket1 })

			// Assertions
			expect(client).to.be.an.instanceOf(Client)
		})
	})

	describe('connected method', () => {
		it('should return true', async () => {
			// Test
			const result = await client.connected()

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('set && get methods', () => {
		it('should set && get value in cache for the key provided', async () => {
			// Add to cache
			await client.set(singlePair.key, singlePair.data)

			// Test
			const result = await client.get(singlePair.key)

			// Assertions
			expect(result).to.equal(singlePair.data)
		})
	})

	describe('setMany && getMany methods', () => {
		it('should set && get many values in cache at once', async () => {
			// Prepared data
			const keys: string[] = []
			const values: string[] = []
			const data: string[] = []

			// Itarete multi pairs
			for (let i = 0; i < multiplePairs.length; i++) {
				// Add to keys
				keys.push(multiplePairs[i].key)

				// Add to values
				values.push(multiplePairs[i].data)

				// Add to data
				data.push(multiplePairs[i].key)
				data.push(multiplePairs[i].data)
			}

			// Set values in cache
			await client.setMany(data)

			// Test
			const result = await client.getMany(keys)

			// Assertions
			expect(result).to.be.like(values)
		})
	})

	describe('remove method', () => {
		it('should remove key-value from cache and return true', async () => {
			// Test
			const result = await client.remove(singlePair.key)

			// Assertions
			expect(result).to.be.true

			// Clean up mulitpairs
			for (let i = 0; i < multiplePairs.length; i++) {
				// Test
				const multiResult = await client.remove(multiplePairs[i].key)

				// Assertions
				expect(multiResult).to.be.true
			}
		})
	})

	describe('selectBucket method', () => {
		it("should change the client's active bucket", async () => {
			// Test
			const result = await client.selectBucket(testBucket2)

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('keys method', () => {
		it('should return an array of ALL keys (strings) in active bucket', async () => {
			// Mock data
			const data = [
				{ key: 'KEYSTEST:1', value: 'TEST1VALUE' },
				{ key: 'KEYSTEST:2', value: 'TEST2VALUE' },
				{ key: 'KEYSTEST:3', value: 'TEST3VALUE' },
				{ key: 'KEYSTEST:4', value: 'TEST4VALUE' },
				{ key: 'KEYSTEST:5', value: 'TEST5VALUE' }
			]

			// Keys to assert
			const keys = []

			// Set values in empty test bucket selected in prev test.
			for (let i = 0; i < data.length; i++) {
				keys.push(data[i].key)
				await client.set(data[i].key, data[i].value)
			}

			// Test
			const result = await client.keys('*')

			// Assertions
			expect(result).to.have.members(keys)
		})
	})

	describe('dumpBucket method', () => {
		it('should remove all values in active bucket', async () => {
			// Test
			const result1 = await client.keys('*')
			const result2 = await client.dumpBucket()
			const result3 = await client.keys('*')

			// Assertions
			expect(result1).to.not.be.empty
			expect(result2).to.be.true
			expect(result3).to.be.empty
		})
	})

	describe('flushAll method', () => {
		it('should remove all values in every bucket', async () => {
			// Has 16 buckets with numerical index/name
			const totalBuckets = 16

			// Add data to ALL buckets
			for (let i = 0; i < totalBuckets; i++) {
				// Select
				await client.selectBucket(i)

				// Add
				await client.set('FUSHALLTEST', 'FUSHALLTESTVALUE')
			}

			// Test
			const result1 = await client.flushAll()

			// Test
			let result2 = true

			// Make sure all buckets are empty
			for (let i = 0; i < totalBuckets; i++) {
				// Select
				await client.selectBucket(i)

				// Get all keys
				const keys = await client.keys('*')

				// Ensure empty
				if (keys.length > 0) {
					result2 = false
				}
			}

			// Assertions
			expect(result1).to.be.true
			expect(result2).to.be.true
		})
	})

	describe('duplicate method', () => {
		it('should an copy of the private _client property', async () => {
			// Test
			const result = await client.duplicate()

			// Clean up
			result.disconnect()

			// Assertions
			expect(result).to.be.an.instanceOf(Client)
		})
	})

	describe('disconnect method', () => {
		it('should return true', async () => {
			// Test
			const result = await client.disconnect()

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('setThrows && getThrows methods', () => {
		it('should set/get private thows property to value given', async () => {
			// Set value
			client.setThrows(true)

			// Test
			const result = client.getThrows()

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('when throws is set to true', () => {
		it('should throw errors and NOT suppress them', async () => {
			// Set value
			client.setThrows(true)

			// Test
			let result = false

			// Need exception for success
			try {
				await client.get('any-value')
			} catch (e) {
				result = true
			}

			// Assertions
			expect(result).to.be.true
		})
	})
})

interface KeyValuePair {
	key: string
	data: string
}
