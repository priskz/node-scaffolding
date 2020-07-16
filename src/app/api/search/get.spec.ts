import { expect } from 'chai'
import { appRequest } from '~/test/util'
import { seeds } from '~/test/seeds/search/content'
import { ContentCache, ContentSchema } from '~/app/domain'
import { SearchClient } from '~/lib/util'
import { AxiosResponse } from 'axios'
import { config } from '~/config'
import { defaultFindQuery } from './get'

//----- Data -----//

// Test index name
const index = 'search-get-api-test-index'

// Search Client
let client: SearchClient

// Store original config value
const defaultSearchIndex = config.search.index.default

// Cache
let contentCache: ContentCache

// Test Params
const testText = 'cbd'
const testFilterTagSlug = 'brain-structure-function'
const testSize = 3
const testFrom = 4
const testFields = ['id', 'title', 'slug']
const testSort = { 'category.name': 'asc' }

//----- Tests -----//

describe('app/api/search/get', () => {
	before(async function() {
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
			await client.add(seeds[i].id as string, seeds[i])
		}

		// Refresh index
		await client.refresh()
	})

	after(async function() {
		// Revert updated config value
		config.search.index.default = defaultSearchIndex

		// Clean up
		await client.deleteIndex()
		await contentCache.flush()
	})

	describe('when invalid type is given', () => {
		it('should return 400', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/search/INVALID')

			// Assertions
			expect(result.status).to.equal(400)
		})
	})

	describe('invalid input', () => {
		describe('raw & text', () => {
			it('raw & text requiredWithout rule should return 400 Bad Request', async () => {
				// Test
				const result: AxiosResponse = await appRequest.post('/search/content')

				// Assertions
				expect(result.status).to.equal(400)
			})
		})

		describe('filter', () => {
			it('sometimes rule should return 400 Bad Request', async () => {
				// Test
				const result: AxiosResponse = await appRequest.post('/search/content', {
					text: testText,
					filter: null
				})

				// Assertions
				expect(result.status).to.equal(400)
			})

			it('object rule should return 400 Bad Request', async () => {
				// Test
				const result: AxiosResponse = await appRequest.post('/search/content', {
					text: testText,
					filter: []
				})

				// Assertions
				expect(result.status).to.equal(400)
			})
		})

		describe('sort', () => {
			it('sometimes rule should return 400 Bad Request', async () => {
				// Test
				const result: AxiosResponse = await appRequest.post('/search/content', {
					text: testText,
					sort: null
				})

				// Assertions
				expect(result.status).to.equal(400)
			})

			it('object rule should return 400 Bad Request', async () => {
				// Test
				const result: AxiosResponse = await appRequest.post('/search/content', {
					text: testText,
					sort: []
				})

				// Assertions
				expect(result.status).to.equal(400)
			})
		})

		describe('from', () => {
			it('sometimes rule should return 400 Bad Request', async () => {
				// Test
				const result: AxiosResponse = await appRequest.post('/search/content', {
					text: testText,
					from: null
				})

				// Assertions
				expect(result.status).to.equal(400)
			})

			it('integer rule should return 400 Bad Request', async () => {
				// Test
				const result: AxiosResponse = await appRequest.post('/search/content', {
					text: testText,
					from: 'not-integer'
				})

				// Assertions
				expect(result.status).to.equal(400)
			})
		})

		describe('size', () => {
			it('sometimes rule should return 400 Bad Request', async () => {
				// Test
				const result: AxiosResponse = await appRequest.post('/search/content', {
					text: testText,
					size: null
				})

				// Assertions
				expect(result.status).to.equal(400)
			})

			it('integer rule should return 400 Bad Request', async () => {
				// Test
				const result: AxiosResponse = await appRequest.post('/search/content', {
					text: testText,
					size: 'not-integer'
				})

				// Assertions
				expect(result.status).to.equal(400)
			})
		})

		describe('fields', () => {
			it('sometimes rule should return 400 Bad Request', async () => {
				// Test
				const result: AxiosResponse = await appRequest.post('/search/content', {
					text: testText,
					fields: null
				})

				// Assertions
				expect(result.status).to.equal(400)
			})

			it('array rule should return 400 Bad Request', async () => {
				// Test
				const result: AxiosResponse = await appRequest.post('/search/content', {
					text: testText,
					fields: 'not-an-array'
				})

				// Assertions
				expect(result.status).to.equal(400)
			})

			it('unique array values rule should return 400 Bad Request', async () => {
				// Test
				const result: AxiosResponse = await appRequest.post('/search/content', {
					text: testText,
					fields: ['id', 'id']
				})

				// Assertions
				expect(result.status).to.equal(400)
			})
		})
	})

	describe(`default query with text: ${testText}`, () => {
		let defaultCount: number
		let defaultData: any[]
		let defaultMaxScore: number | null

		it('should return 200 with results in body', async () => {
			// Request body
			const body = { text: testText, fields: ['id', 'slug', 'tag'] }

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Set default values for other tests
			defaultCount = result.data.count
			defaultData = result.data.data
			defaultMaxScore = result.data.maxScore

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(9)
			expect(result.data.maxScore).to.equal(5.6420274)
			expect(result.data.data.length).to.equal(9)
		})

		it('sort param should return 200 with results in body ordered by param specified', async () => {
			// Request body
			const body = {
				text: testText,
				sort: testSort
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(defaultCount)
			expect(result.data.maxScore).to.be.null
			expect(result.data.data.length).to.equal(defaultCount)
			expect(result.data.data[0].source.id).to.not.equal(
				defaultData[0].source.id
			)
		})

		it('size option should return 200 with results in body limited to specified size', async () => {
			// Request body
			const body = {
				text: testText,
				size: testSize
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(testSize)
			expect(result.data.maxScore).to.equal(defaultMaxScore)
			expect(result.data.data.length).to.equal(testSize)
		})

		it('from option should return 200 with results in body starting at position specified', async () => {
			// Request body
			const body = {
				text: testText,
				from: testFrom
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(defaultCount - testFrom)
			expect(result.data.maxScore).to.equal(defaultMaxScore)
			expect(result.data.data.length).to.equal(defaultCount - testFrom)
		})

		it('fields option should return 200 with results in body with only fields specified', async () => {
			// Request body
			const body = {
				text: testText,
				fields: testFields
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(defaultCount)
			expect(result.data.maxScore).to.equal(defaultMaxScore)
			expect(result.data.data.length).to.equal(defaultCount)
			expect(result.data.data[0].source).to.have.property('id')
			expect(result.data.data[0].source).to.have.property('title')
			expect(result.data.data[0].source).to.have.property('slug')
			expect(result.data.data[0].source).to.not.have.property('category')
			expect(result.data.data[0].source).to.not.have.property('tag')
		})

		it('size, from, & fields options specified should return 200 with results in body', async () => {
			// Request body
			const body = {
				text: testText,
				fields: testFields,
				size: testSize,
				from: testFrom
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(testSize)
			expect(result.data.maxScore).to.equal(defaultMaxScore)
			expect(result.data.data.length).to.equal(testSize)
			expect(result.data.data[0].source).to.have.property('id')
			expect(result.data.data[0].source).to.have.property('title')
			expect(result.data.data[0].source).to.have.property('slug')
			expect(result.data.data[0].source).to.not.have.property('category')
			expect(result.data.data[0].source).to.not.have.property('tag')
			expect(result.data.data[0].source.id).to.not.equal(
				defaultData[0].source.id
			)
		})

		it('filter specified should return 200 with results filtered in body', async () => {
			// Request body
			const body = {
				text: testText,
				filter: { 'tag.slug': testFilterTagSlug }
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(2)
			expect(result.data.maxScore).to.equal(2.2894392)
			expect(result.data.data.length).to.equal(2)
		})

		it('as raw should return 200 with results in body', async () => {
			// Request body
			const body = {
				raw: defaultFindQuery(testText)
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(defaultCount)
			expect(result.data.maxScore).to.equal(defaultMaxScore)
			expect(result.data.data.length).to.equal(defaultData.length)
		})

		it('as raw sort param should return 200 with results in body ordered by param specified', async () => {
			// Request body
			const body = {
				raw: defaultFindQuery(testText),
				sort: testSort
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(defaultCount)
			expect(result.data.maxScore).to.be.null
			expect(result.data.data.length).to.equal(defaultCount)
			expect(result.data.data[0].source.id).to.not.equal(
				defaultData[0].source.id
			)
		})

		it('as raw with size option should return 200 with results in body limited to specified size', async () => {
			// Request body
			const body = {
				raw: defaultFindQuery(testText),
				size: testSize
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(testSize)
			expect(result.data.maxScore).to.equal(defaultMaxScore)
			expect(result.data.data.length).to.equal(testSize)
		})

		it('as raw with from option should return 200 with results in body starting at position specified', async () => {
			// Request body
			const body = {
				raw: defaultFindQuery(testText),
				from: testFrom
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(defaultCount - testFrom)
			expect(result.data.maxScore).to.equal(defaultMaxScore)
			expect(result.data.data.length).to.equal(defaultCount - testFrom)
		})

		it('as raw with fields option should return 200 with results in body with only fields specified', async () => {
			// Request body
			const body = {
				raw: defaultFindQuery(testText),
				fields: ['id', 'title', 'slug']
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(defaultCount)
			expect(result.data.maxScore).to.equal(defaultMaxScore)
			expect(result.data.data.length).to.equal(defaultCount)
			expect(result.data.data[0].source).to.have.property('id')
			expect(result.data.data[0].source).to.have.property('title')
			expect(result.data.data[0].source).to.have.property('slug')
			expect(result.data.data[0].source).to.not.have.property('category')
			expect(result.data.data[0].source).to.not.have.property('tag')
		})

		it('as raw with size, from, & fields options specified should return 200 with results in body', async () => {
			// Request body
			const body = {
				raw: defaultFindQuery(testText),
				fields: testFields,
				size: testSize,
				from: testFrom
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(testSize)
			expect(result.data.maxScore).to.equal(defaultMaxScore)
			expect(result.data.data.length).to.equal(testSize)
			expect(result.data.data[0].source).to.have.property('id')
			expect(result.data.data[0].source).to.have.property('title')
			expect(result.data.data[0].source).to.have.property('slug')
			expect(result.data.data[0].source).to.not.have.property('category')
			expect(result.data.data[0].source).to.not.have.property('tag')
			expect(result.data.data[0].source.id).to.not.equal(
				defaultData[0].source.id
			)
		})

		it('as raw with filter specified should return 200 with results filtered in body', async () => {
			// Request body
			const body = {
				raw: defaultFindQuery(testText),
				filter: { 'tag.slug': testFilterTagSlug }
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.count).to.equal(2)
			expect(result.data.maxScore).to.equal(2.2894392)
			expect(result.data.data.length).to.equal(2)
		})
	})

	describe('raw query has invalid syntax', () => {
		it('should return 500', async () => {
			// Request body
			const body = {
				raw: {
					// Invalid Key
					query1: {
						bool: {
							must: {
								multi_match: {
									type: 'best_fields', // default
									query: testText,
									fields: ['slug^3', 'title^3', 'subtitle^2', 'body']
								}
							}
						}
					},
					sort: { 'category.name': 'asc' }
				}
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(500)
		})
	})

	describe('raw query with no results', () => {
		it('should return 404', async () => {
			// Request body
			const body = {
				raw: {
					// Invalid Key
					query: {
						bool: {
							must: {
								multi_match: {
									type: 'best_fields', // default
									query: testText,
									fields: ['slug^3', 'title^3', 'subtitle^2', 'body']
								}
							},
							filter: {
								term: { 'tag.slug': 'baseball' }
							}
						}
					}
				}
			}

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/search/content',
				body
			)

			// Assertions
			expect(result.status).to.equal(404)
		})
	})

	describe('default text query with no results', () => {
		it('should return 404', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/search/content', {
				text: 'blah blah blah blah'
			})

			// Assertions
			expect(result.status).to.equal(404)
		})
	})
})
