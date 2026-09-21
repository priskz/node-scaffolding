import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetRaw = vi.fn()
const mockSet = vi.fn()
const mockFindOneById = vi.fn()

vi.mock('~/lib/util', () => ({
	DefaultCache: class
	{
		protected prefix = ''
		protected db = 0
		public getRaw(id: string | number) { return mockGetRaw(id) }
		public set(id: string | number, data: unknown) { return mockSet(id, data) }
	},
	DefaultSearch: class
	{
		public find() { return Promise.resolve({ data: [] }) }
		public update() { return Promise.resolve(false) }
		public refresh() { return Promise.resolve(true) }
		public getClient() { return { getIndex: () => 'test' } }
		public getSource() { return { updateByQuery: () => Promise.resolve({ statusCode: 200, body: {} }) } }
	},
	log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('~/app/domain/content/ContentRepository', () => ({
	ContentRepository: class { public findOneById(id: string) { return mockFindOneById(id) } },
}))

import { ContentCache } from './ContentCache'

describe('app/domain/content/ContentCache', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	describe('configuration', () =>
	{
		it('should use content prefix and db 3', () =>
		{
			const cache = new ContentCache()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect((cache as any).prefix).toBe('content')
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect((cache as any).db).toBe(3)
		})
	})

	describe('fetch', () =>
	{
		it('should return parsed content when cache hit', async () =>
		{
			const content = { id: 'abc', title: 'Hello' }
			mockGetRaw.mockResolvedValue(JSON.stringify(content))

			const cache = new ContentCache()
			const result = await cache.fetch('abc')

			expect(result).toEqual(content)
			expect(mockFindOneById).not.toHaveBeenCalled()
		})

		it('should load from source and cache when cache miss', async () =>
		{
			const content = { id: 'xyz', title: 'Fresh' }
			mockGetRaw.mockResolvedValue(null)
			mockFindOneById.mockResolvedValue(content)
			mockSet.mockResolvedValue(true)

			const cache = new ContentCache()
			const result = await cache.fetch('xyz')

			expect(result).toEqual(content)
			expect(mockSet).toHaveBeenCalledWith('xyz', JSON.stringify(content))
		})

		it('should return undefined on cache miss with shouldCache=false', async () =>
		{
			mockGetRaw.mockResolvedValue(null)

			const cache = new ContentCache()
			const result = await cache.fetch('none', false)

			expect(result).toBeUndefined()
			expect(mockFindOneById).not.toHaveBeenCalled()
		})

		it('should return undefined when source miss', async () =>
		{
			mockGetRaw.mockResolvedValue(null)
			mockFindOneById.mockResolvedValue(undefined)

			const cache = new ContentCache()
			const result = await cache.fetch('missing')

			expect(result).toBeUndefined()
			expect(mockSet).not.toHaveBeenCalled()
		})
	})

	describe('saveById', () =>
	{
		it('should cache content looked up by id', async () =>
		{
			const content = { id: 'id1', title: 'T' }
			mockFindOneById.mockResolvedValue(content)
			mockSet.mockResolvedValue(true)

			const cache = new ContentCache()
			const ok = await cache.saveById('id1')

			expect(ok).toBe(true)
			expect(mockSet).toHaveBeenCalledWith('id1', JSON.stringify(content))
		})

		it('should return false when content not found', async () =>
		{
			mockFindOneById.mockResolvedValue(undefined)

			const cache = new ContentCache()
			const ok = await cache.saveById('missing')

			expect(ok).toBe(false)
			expect(mockSet).not.toHaveBeenCalled()
		})
	})

	describe('save', () =>
	{
		it('should cache the given content', async () =>
		{
			const content = { id: 'id2', title: 'Save' }
			mockSet.mockResolvedValue(true)

			const cache = new ContentCache()
			const ok = await cache.save(content as never)

			expect(ok).toBe(true)
			expect(mockSet).toHaveBeenCalledWith('id2', JSON.stringify(content))
		})

		it('should refresh from source when refresh=true', async () =>
		{
			const stale = { id: 'id3', title: 'Old' }
			const fresh = { id: 'id3', title: 'New' }
			mockFindOneById.mockResolvedValue(fresh)
			mockSet.mockResolvedValue(true)

			const cache = new ContentCache()
			const ok = await cache.save(stale as never, true)

			expect(ok).toBe(true)
			expect(mockSet).toHaveBeenCalledWith('id3', JSON.stringify(fresh))
		})

		it('should return false when refresh finds no source', async () =>
		{
			mockFindOneById.mockResolvedValue(undefined)

			const cache = new ContentCache()
			const ok = await cache.save({ id: 'gone' } as never, true)

			expect(ok).toBe(false)
			expect(mockSet).not.toHaveBeenCalled()
		})
	})
})
