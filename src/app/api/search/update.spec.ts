import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'
import { seeds } from '~/test/seeds/search/content'
import { ContentCache, ContentSchema } from '~/app/domain'
import { SearchClient } from '~/lib/util'
import { config } from '~/config'

//----- Data -----//

// Test index name
const index = 'search-update-api-test-index'

// Search Client
let client: SearchClient

// Store original config value
const defaultSearchIndex = config.search.index.default

// Test Cache
let contentCache: ContentCache

// Test Source
const testSource = {
	id: '2D3DFekojnTvUZO35dgc9L',
	title: '25 Best CBD Gummies on the Market',
	slug: '25-best-cbd-gummies-on-the-market'
}

//----- Tests -----//

describe('app/api/search/update', () => {
	before(async () => {
		// Init cache
		contentCache = new ContentCache()

		// Change config value for tests
		config.search.index.default = index

		// Create client
		client = new SearchClient(index)

		// Create test index
		await SearchClient.createIndex(index, ContentSchema)

		// Add seed data
		for (let i = 0; i < seeds.length; i++) {
			await client.add(seeds[i].id as string, {
				...seeds[i],
				title: 'Can Be Updated'
			})
		}

		// Refresh index
		await client.refresh()
	})

	after(async () => {
		// Revert updated config value
		config.search.index.default = defaultSearchIndex

		// Clean up
		await client.deleteIndex()
		await contentCache.flush()
	})

	describe('valid input provided', () => {
		it('source changed, should return 204 No Content', async () => {
			// Test
			const result: AxiosResponse = await appRequest.put(
				`/search/content/${testSource.id}`
			)

			// Assertions
			expect(result.status).to.equal(204)
		})
	})

	describe('valid input for unchanged source provided', () => {
		it('should return 500', async () => {
			// Test
			const result: AxiosResponse = await appRequest.put(
				`/search/content/${testSource.id}`
			)

			// Assertions
			expect(result.status).to.equal(500)
		})
	})

	describe('invalid type input', () => {
		it('required|in should return 400 Bad Request', async () => {
			// Test
			const result: AxiosResponse = await appRequest.put(
				'/search/invalid/some-valid-id'
			)

			// Assertions
			expect(result.status).to.equal(400)
		})
	})

	describe('invalid id input', () => {
		it('required should return 404 Not Found', async () => {
			// Test
			const result: AxiosResponse = await appRequest.put('/search/content')

			// Assertions
			expect(result.status).to.equal(404)
		})
	})
})
