import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'
import { config } from '~/config'
import { SearchClient } from '~/lib/util'

//----- Data -----//

// Test index name
const index = 'search-refresh-api-test-index'

// Search Client
let client: SearchClient

// Store original config value
const defaultSearchIndex = config.search.index.default

//----- Tests -----//

describe('app/api/search/refresh', () => {
	before(async function() {
		// Change config value for tests
		config.search.index.default = index

		// Create client
		client = new SearchClient(index)

		// Create test index
		await SearchClient.createIndex(index, {})
	})

	after(async function() {
		// Revert updated config value
		config.search.index.default = defaultSearchIndex

		// Clean up
		await client.deleteIndex()
	})

	describe('when valid domain and type params are given', () => {
		it('should refresh search index and return 204', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/default/refresh'
			)

			// Assertions
			expect(result.status).to.equal(204)
		})
	})

	describe('when invalid index is given', () => {
		it('should return 400', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/INVALID/refresh'
			)

			// Assertions
			expect(result.status).to.equal(400)
		})
	})
})
