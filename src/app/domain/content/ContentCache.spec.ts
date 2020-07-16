import { expect } from 'chai'
import { Content, ContentCache } from './'

describe('app/domain/content/ContentCache', () => {
	// Test Subject
	let contentCache: ContentCache

	// Test Source
	const testSource = {
		id: '2D3DFekojnTvUZO35dgc9L',
		title: '25 Best CBD Gummies on the Market',
		slug: '25-best-cbd-gummies-on-the-market'
	}

	// Test Content from source
	let testContent: Content

	after(async () => {
		// Clean up
		await contentCache.flush()
	})

	describe('constructor method', () => {
		it('should create a new instance', async () => {
			// Test
			contentCache = new ContentCache()

			// Assertions
			expect(contentCache).to.be.an.instanceOf(ContentCache)
		})
	})

	describe('getSource method', () => {
		it('should return raw data from source', async () => {
			// Test
			testContent = (await contentCache.getSource(testSource.id)) as Content

			// Assertions
			expect(testContent.id).to.equal(testSource.id)
			expect(testContent.title).to.equal(testSource.title)
			expect(testContent.slug).to.equal(testSource.slug)
		})

		it('should return undefined if not found', async () => {
			// Test
			const result = (await contentCache.getSource('does-not-exist')) as Content

			// Assertions
			expect(result).to.be.undefined
		})
	})

	describe('save method', () => {
		it('should set given Content in cache and return true', async () => {
			// Test
			const result = await contentCache.save(testContent)

			// Assertions
			expect(result).to.be.true
		})

		it('when refresh param is true it should retrieve from source, set given Content in cache, and return true', async () => {
			// Test
			const result = await contentCache.save(testContent, true)

			// Clean up
			await contentCache.flush()

			// Assertions
			expect(result).to.be.true
		})

		it('when refresh param is true and id does not exist in source it should return false', async () => {
			// Mock
			const missingContent = new Content()

			// Set id
			missingContent.id = 'content-id-does-not-exist'

			// Test
			const result = await contentCache.save(missingContent, true)

			// Assertions
			expect(result).to.be.false
		})
	})

	describe('saveById method', () => {
		it('should return true if found and set in cache', async () => {
			// Test
			const result = await contentCache.saveById(testSource.id)

			// Clean up
			await contentCache.flush()

			// Assertions
			expect(result).to.be.true
		})

		it('should return false if not found in source', async () => {
			// Test
			const result = await contentCache.saveById(
				'this-content-id-does-not-exist'
			)

			// Assertions
			expect(result).to.be.false
		})
	})

	describe('fetch method', () => {
		it('if optional param is false it should return undefined if not found in cache', async () => {
			// Test
			const result = await contentCache.fetch(testSource.id, false)

			// Assertions
			expect(result).to.be.undefined
		})

		it('if not in cache, should retrieve from source, add to cache, and return Content', async () => {
			// Test
			const result = (await contentCache.fetch(testSource.id)) as Content

			// Assertions
			expect(result.id).to.equal(testContent.id)
			expect(result.title).to.equal(testContent.title)
			expect(result.slug).to.equal(testContent.slug)
		})

		it('if in cache and optional cache param is false, it should return Content', async () => {
			// Test
			const result = (await contentCache.fetch(testSource.id, false)) as Content

			// Assertions
			expect(result.id).to.equal(testContent.id)
			expect(result.title).to.equal(testContent.title)
			expect(result.slug).to.equal(testContent.slug)
		})

		it('if in cache and no optional param is given it should return Content', async () => {
			// Test
			const result = (await contentCache.fetch(testSource.id)) as Content

			// Assertions
			expect(result.id).to.equal(testContent.id)
			expect(result.title).to.equal(testContent.title)
			expect(result.slug).to.equal(testContent.slug)
		})

		it('if source not found should return undefined', async () => {
			// Test
			const result = (await contentCache.fetch('does-not-exist')) as Content
			// Assertions
			expect(result).to.be.undefined
		})
	})
})
