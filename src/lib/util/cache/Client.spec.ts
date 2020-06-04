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
			client = new Client(config)

			// Assertions
			client.should.be.an.instanceOf(Client)
		})
	})

	describe('connected method', () => {
		it('should return true', async () => {
			// Test
			const result = await client.connected()

			// Assertions
			result.should.be.true
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
		it('should remove key-value from cache and return 1', async () => {
			// Test
			const result = await client.remove(singlePair.key)

			// Assertions
			result.should.be.true

			// Clean up mulitpairs
			for (let i = 0; i < multiplePairs.length; i++) {
				// Test
				const multiResult = await client.remove(multiplePairs[i].key)

				// Assertions
				multiResult.should.be.true
			}
		})
	})

	describe('flushAll method', () => {
		it.skip('should remove all values in every bucket')
	})

	describe('dumpBucket method', () => {
		it.skip('should remove all values in active bucket')
	})

	describe('selectBucket method', () => {
		it.skip("should change the client's active bucket")
	})

	describe('keys method', () => {
		it.skip('should return an array of ALL keys (strings) in active bucket')
	})

	describe('duplicate method', () => {
		it.skip('should an copy of the private _client property')
	})

	describe('disconnect method', () => {
		it('should return true', async () => {
			// Test
			const result = await client.disconnect()

			// Assertions
			result.should.be.true
		})
	})
})

interface KeyValuePair {
	key: string
	data: string
}
