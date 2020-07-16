import { expect } from 'chai'
import { SearchClient } from './'
import { ContentSchema } from '~/app/domain/content'

//----- Tests -----//

describe('lib/util/search/SearchClient', () => {
	// Test Subject
	let client: SearchClient

	// Test index name
	const testIndex = 'search-client-index'

	// Test content data
	const content = {
		id: 'test-content-id-goes-here',
		title: 'Test Title',
		subtitle: 'Test Subtitle',
		body: 'Test Body',
		slug: 'test-slug',
		image: {
			id: 'test-content-image-id',
			title: 'test-content-image-id',
			url: 'http://placehold.it/32x32',
			description: 'test-content-image-description'
		},
		meta: {
			publicationDate: '2001-12-12',
			template: 'test-content-meta-template'
		},
		authors: {
			id: 'test-author-id-goes-here',
			name: 'Test Author Name',
			slug: 'test-author-slug',
			image: {
				id: 'test-author-image-id-here',
				title: 'Test Author Image Title',
				url: 'http://placehold.it/32x32'
			}
		},
		blog: {
			id: 'test-blog-id-goes-here',
			name: 'Test Blog Name',
			slug: 'test-blog-slug',
			image: {
				id: 'test-blog-image-id-here',
				title: 'Test Blog Image Title',
				url: 'http://placehold.it/32x32'
			}
		},
		category: {
			id: 'test-category-id-goes-here',
			name: 'Test Category Name',
			slug: 'test-category-name',
			image: {
				id: 'test-category-image-goes-here',
				title: 'Test Category Image Title',
				url: 'http://placehold.it/32x32'
			}
		},
		department: {
			id: 'test-department-id-goes-here',
			name: 'Test Department Name',
			slug: 'test-department-slug',
			image: {
				id: 'test-department-image-id-here',
				title: 'Test Department Image Title',
				url: 'http://placehold.it/32x32'
			}
		},

		issue: {
			id: 'test-issue-id-goes-here',
			slug: 'test-issue-slug',
			publication: {
				period: 'TestPeriod',
				date: '2020-12-25'
			},
			image: {
				id: 'test-issue-image-here',
				title: 'Test Issue Image Title',
				url: 'http://placehold.it/32x32'
			}
		},
		tags: [
			{
				id: 'test-tag-1-id-here',
				name: 'Test Tag 1 Name',
				slug: 'test-tag-1-name',
				image: {
					id: 'test-tag-1-image-id',
					title: 'Test Tag 1 Image Title',
					url: 'http://placehold.it/32x32'
				}
			},
			{
				id: 'test-tag-2-id-here',
				name: 'Test Tag 2 Name',
				slug: 'test-tag-2-name',
				image: {
					id: 'test-tag-2-image-id',
					title: 'Test Tag 2 Image Title',
					url: 'http://placehold.it/32x32'
				}
			},
			{
				id: 'test-tag-3-id-here',
				name: 'Test Tag 3 Name',
				slug: 'test-tag-3-name',
				image: {
					id: 'test-tag-3-image-id',
					title: 'Test Tag 3 Image Title',
					url: 'http://placehold.it/32x32'
				}
			}
		]
	}

	after(async () => {
		// Clean up
		if (await client.indexExists()) {
			await client.deleteIndex()
		}
	})

	describe('constructor method', () => {
		it('should create a new instance', async () => {
			// Test
			client = new SearchClient(testIndex)

			// Assertions
			expect(client).to.be.an.instanceOf(SearchClient)
		})
	})

	describe('get & set index property methods', () => {
		it('should set index property to value given', async () => {
			const newTestIndexValue = testIndex + '-setter'

			// Test setter
			client.setIndex(newTestIndexValue)

			// Test getter
			const result = client.getIndex()

			// Clean up
			client.setIndex(testIndex.replace('-setter', ''))

			// Assertions
			expect(result).to.equal(newTestIndexValue)
		})
	})

	describe('ping method', () => {
		it('should return true', async () => {
			// Test
			const result = await client.ping()

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('indexExists method', () => {
		it('should return false', async () => {
			// Test
			const result = await client.indexExists()

			// Assertions
			expect(result).to.be.false
		})
	})

	describe('create method', () => {
		it('should create index and return true', async () => {
			// Test
			const result = await SearchClient.createIndex(testIndex, ContentSchema)

			expect(result).to.be.true
		})
	})

	describe('add method', () => {
		it('should add data to index and return true', async () => {
			// Test
			const result = await client.add(content.id, content)

			// Assertions
			expect(result).to.be.true
		})

		it('should throw if index does not exist', async () => {
			// Setup
			const missingIndexClient = new SearchClient('missing-index-test')

			// Assertions
			expect(async function() {
				await missingIndexClient.add('some-id-value', {})
			}).to.throw
		})
	})

	describe('search method is used on unrefreshed index data', () => {
		it('should return null maxScore and empty data array', async () => {
			// Test
			const result = await client.search({
				query: {
					match: {
						title: content.title
					}
				}
			})

			// Assertions
			expect(result.maxScore).to.be.null
			expect(result.data).to.be.empty
		})
	})

	describe('refresh method is used', () => {
		it('should make newly added data searchable and return true', async () => {
			// Test
			const result = await client.refresh()

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('count method', () => {
		it('should return a number equal to length of seed array', async () => {
			// Test
			const result = await client.count()

			// Assertions
			expect(result).to.equal(1)
		})
	})

	describe('search is used on existing data', () => {
		it('should return a maxScore value and matches', async () => {
			// Test
			const result = await client.search({
				query: {
					match: {
						title: content.title
					}
				}
			})

			// Assertions
			expect(result.maxScore).to.not.be.null
			expect(result.data).to.not.be.empty
		})
	})

	describe('search is unable to find any matches', () => {
		it('should return null maxScore and empty data array', async () => {
			// Test
			const result = await client.search({
				query: {
					match: {
						title: 'does-not-exist'
					}
				}
			})

			// Assertions
			expect(result.maxScore).to.be.null
			expect(result.data).to.be.empty
		})
	})

	describe('update method is called on existing data', () => {
		it('should return true', async () => {
			// Find data to update
			const search = await client.search({
				query: {
					match: {
						title: content.title
					}
				}
			})

			// New data
			const contentUpdate = { title: 'Some Specific Title' }

			// Test
			const result1 = await client.update(search.data[0].id, contentUpdate)

			// Refresh index to make sure update takes effect
			await client.refresh()

			// Find data to update
			const result2 = await client.search({
				query: {
					match: contentUpdate
				}
			})

			// Assertions
			expect(result1).to.be.true
			expect(result2.data[0].source)
				.to.have.property('title')
				.equal(contentUpdate.title)
		})
	})

	describe('deleteIndex method', () => {
		it('should delete index and all data', async () => {
			// Test
			const result = await client.deleteIndex()

			// Assertions
			expect(result).to.be.true
		})
	})
})
