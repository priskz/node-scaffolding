import { expect } from 'chai'
import { seeds } from '~/test/seeds/search/content'
import { Client as ElasticSearchClient } from '@elastic/elasticsearch'
import { DefaultSearch, SearchClient } from './'
import { Content } from '~/app/domain/content'

//----- Tests -----//

describe('lib/util/search/DefaultSearch', () => {
	// Test Object
	let defaultSearch: DefaultSearch

	// Test cleint
	let client: SearchClient

	// Test index name
	const index = 'default-search-test-index'

	// Test updated slug value
	const newSlug = 'some-new-updated-slug-value'

	before(async function() {
		// Create test client
		client = new SearchClient(index)

		// Create test index
		await SearchClient.createIndex(index, {})

		// Add seed data
		for (let i = 0; i < seeds.length; i++) {
			await client.add(seeds[i].id as string, seeds[i])
		}

		// Refresh data
		await client.refresh()
	})

	after(async function() {
		// Clean up
		await client.deleteIndex()
	})

	describe('constructor method', () => {
		it('with no optional params it should create a new instance of DefaultSearch', async () => {
			// Test
			defaultSearch = new DefaultSearch<Content>()

			// Assertions
			expect(defaultSearch).to.be.an.instanceOf(DefaultSearch)
		})

		it('when given optional client it should create a new instance of DefaultSearch', async () => {
			// Test
			defaultSearch = new DefaultSearch<Content>({ index, client })

			// Assertions
			expect(defaultSearch).to.be.an.instanceOf(DefaultSearch)
		})

		it('should create a new instance of DefaultSearch', async () => {
			// Test
			defaultSearch = new DefaultSearch<Content>({ index })

			// Assertions
			expect(defaultSearch).to.be.an.instanceOf(DefaultSearch)
		})
	})

	describe('getSource method', () => {
		it('should return instance of ES client', async () => {
			// Test
			const result = await defaultSearch.getSource()

			// Assertions
			expect(result).to.be.an.instanceOf(ElasticSearchClient)
		})
	})

	describe('getClient method', () => {
		it('should return instance of SearchClient util', async () => {
			// Test
			const result = await defaultSearch.getClient()

			// Assertions
			expect(result).to.be.an.instanceOf(SearchClient)
		})
	})

	describe('find successfully matches data', () => {
		it('should return a SearchResults with data populated', async () => {
			// Build search body
			const body = {
				query: {
					match: { id: seeds[0].id }
				}
			}

			// Test
			const result = await defaultSearch.find(body)

			// Assertions
			expect(result)
				.to.have.property('count')
				.equal(1)
			expect(result)
				.to.have.property('maxScore')
				.greaterThan(0)
			expect(result)
				.to.have.property('data')
				.with.lengthOf(1)
			expect(result.data[0].source)
				.to.have.property('slug')
				.equal(seeds[0].slug)
		})
	})

	describe('find can NOT match data', () => {
		it('should return a SearchResults with no data populated', async () => {
			// Build search body
			const body = {
				query: {
					match: { id: 'does-not-exist' }
				}
			}

			// Test
			const result = await defaultSearch.find(body)

			// Assertions
			expect(result)
				.to.have.property('count')
				.equal(0)
			expect(result).to.have.property('maxScore').to.be.null
			expect(result)
				.to.have.property('data')
				.with.lengthOf(0)
		})
	})

	describe('update method', () => {
		it('should return true', async () => {
			// Test
			const result = await defaultSearch.update(seeds[0].id as string, {
				slug: newSlug
			})

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('refresh method', () => {
		it('should return true', async () => {
			// Test
			const result = await defaultSearch.refresh()

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('find updated data', () => {
		it('should return SearchResult with updated value', async () => {
			// Test
			const result = await defaultSearch.find({
				query: {
					match: { slug: newSlug }
				}
			})

			// Assertions
			expect(result)
				.to.have.property('count')
				.equal(1)
			expect(result)
				.to.have.property('maxScore')
				.gt(0)
			expect(result)
				.to.have.property('data')
				.with.lengthOf(1)
		})

		it('should return a SearchResults data populated for new slug value', async () => {
			// Test
			const result = await defaultSearch.find({
				query: {
					match: { slug: newSlug }
				}
			})

			// Assertions
			expect(result)
				.to.have.property('count')
				.equal(1)
			expect(result)
				.to.have.property('maxScore')
				.greaterThan(0)
			expect(result)
				.to.have.property('data')
				.with.lengthOf(1)
			expect(result.data[0].source)
				.to.have.property('slug')
				.equal(newSlug)
		})
	})
})
