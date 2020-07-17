import { expect } from 'chai'
import { seeds } from '~/test/seeds/content'
import { SearchClient } from '~/lib/util'
import { Content, ContentSearch } from './'
import { ContentSchema } from './types/ContentSchema'

describe('app/domain/search/content/ContentSearch', () => {
	// Test Subject
	let contentSearch: ContentSearch

	// Test index name
	const index = 'test-content-search-index'

	// Search Client
	let client: SearchClient

	before(async () => {
		// Create client
		client = new SearchClient(index)

		// Create test index
		await SearchClient.createIndex(index, ContentSchema)

		// Add seed data
		for (let i = 0; i < seeds.length; i++) {
			await client.add(seeds[i].id as string, seeds[i])
		}

		// Refresh index
		await client.refresh()
	})

	after(async () => {
		// Clean up
		await client.deleteIndex()
	})

	describe('constructor method', () => {
		it('should create a new instance', async () => {
			// Test
			contentSearch = new ContentSearch({ index })

			// Assertions
			expect(contentSearch).to.be.an.instanceOf(ContentSearch)
		})
	})

	describe('when replace is called', () => {
		it('should update instance and return true', async () => {
			// Updated data
			const data = {
				name: 'UpdatedGeographyCategoryName',
				slug: 'updated-geography-category-slug'
			}

			const result1 = await contentSearch.find({
				query: {
					match: { 'category.slug': 'geography' }
				}
			})

			// Test Data
			const content = {
				category: {
					id: 'ea3ec826372c4a6f8ec66ad085f1c419',
					name: data.name,
					slug: data.slug
				}
			} as Content

			// Test
			const result2 = await contentSearch.replace(
				seeds[0].id as string,
				content
			)

			await client.refresh()

			const result3 = await contentSearch.find({
				query: {
					match: { 'category.slug': 'geography' }
				}
			})

			// Assertions
			expect(result1)
				.to.have.property('count')
				.equal(8)
			expect(result1)
				.to.have.property('maxScore')
				.greaterThan(0)
			expect(result1)
				.to.have.property('data')
				.with.lengthOf(8)
			expect(result2).to.be.true
			expect(result3)
				.to.have.property('count')
				.equal(0)
			expect(result3).to.have.property('maxScore').to.be.null
			expect(result3)
				.to.have.property('data')
				.with.lengthOf(0)
		})
	})

	describe('replace is called on entity that does not exist in search index', () => {
		it('should return false', async () => {
			// Test Data
			const content = {
				category: {
					id: 'ea3ec826372c4a6f8ec66ad085f1c419',
					name: 'Geography',
					slug: 'geography'
				}
			} as Content

			// Test
			const result = await contentSearch.replace('no-existing-id', content)

			// Assertions
			expect(result).to.be.false
		})
	})
})
