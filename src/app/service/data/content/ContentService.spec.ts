import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetOne = vi.fn()
const mockSearchReplace = vi.fn()

vi.mock('~/lib/service/DataService', () => ({
	DataService: class
	{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		protected repository: any
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		constructor(repository: any) { this.repository = repository }
		public getOne(query: unknown) { return mockGetOne(query) }
	},
}))

vi.mock('~/app/domain', () => ({
	ContentRepository: class {},
	ContentSearch: class
	{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		constructor(_opts?: any) {}
		public replace(id: string, content: unknown) { return mockSearchReplace(id, content) }
	},
}))

vi.mock('~/config', () => ({
	config: { search: { index: { default: 'test-index' } } },
}))

import { ContentService } from './ContentService'

describe('app/service/data/content/ContentService', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should construct with a ContentRepository and ContentSearch', () =>
	{
		const service = new ContentService()
		expect(service).toBeInstanceOf(ContentService)
	})

	it('should throw when default search index is not configured', async () =>
	{
		vi.resetModules()
		vi.doMock('~/config', () => ({
			config: { search: { index: { default: '' } } },
		}))
		vi.doMock('~/lib/service/DataService', () => ({
			DataService: class { constructor(_repo: unknown) {} },
		}))
		vi.doMock('~/app/domain', () => ({
			ContentRepository: class {},
			ContentSearch: class {},
		}))

		const { ContentService: Svc } = await import('./ContentService')
		expect(() => new Svc()).toThrow(/index prop not configured/)
	})

	describe('getOneById', () =>
	{
		it('should delegate to getOne filtered by id', async () =>
		{
			const content = { id: 'c1', title: 'T' }
			mockGetOne.mockResolvedValue(content)

			const service = new ContentService()
			const result = await service.getOneById('c1')

			expect(result).toBe(content)
			expect(mockGetOne).toHaveBeenCalledWith({ where: { id: 'c1' } })
		})
	})

	describe('updateSearchIndex', () =>
	{
		it('should return false when content not found', async () =>
		{
			mockGetOne.mockResolvedValue(undefined)

			const service = new ContentService()
			const ok = await service.updateSearchIndex('missing')

			expect(ok).toBe(false)
			expect(mockSearchReplace).not.toHaveBeenCalled()
		})

		it('should return true when replace succeeds', async () =>
		{
			const content = { id: 'c1', title: 'T' }
			mockGetOne.mockResolvedValue(content)
			mockSearchReplace.mockResolvedValue(true)

			const service = new ContentService()
			const ok = await service.updateSearchIndex('c1')

			expect(ok).toBe(true)
			expect(mockSearchReplace).toHaveBeenCalledWith('c1', content)
		})

		it('should return false when replace fails', async () =>
		{
			const content = { id: 'c1', title: 'T' }
			mockGetOne.mockResolvedValue(content)
			mockSearchReplace.mockResolvedValue(false)

			const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

			const service = new ContentService()
			const ok = await service.updateSearchIndex('c1')

			expect(ok).toBe(false)
			errSpy.mockRestore()
		})
	})
})
