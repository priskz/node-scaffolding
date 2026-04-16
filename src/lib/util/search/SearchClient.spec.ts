import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
	mockCount,
	mockExists,
	mockPing,
	mockSearch,
	mockCreate,
	mockIndex,
	mockRefresh,
	mockUpdate,
	mockDelete,
	mockLogInfo,
	ClientCtor,
} = vi.hoisted(() =>
{
	const mockCount = vi.fn()
	const mockExists = vi.fn()
	const mockPing = vi.fn()
	const mockSearch = vi.fn()
	const mockCreate = vi.fn()
	const mockIndex = vi.fn()
	const mockRefresh = vi.fn()
	const mockUpdate = vi.fn()
	const mockDelete = vi.fn()
	const mockLogInfo = vi.fn()

	const ClientCtor = vi.fn(function (this: Record<string, unknown>, opts: unknown)
	{
		this.opts = opts
		this.count = mockCount
		this.indices = {
			exists: mockExists,
			create: mockCreate,
			refresh: mockRefresh,
			delete: mockDelete,
		}
		this.ping = mockPing
		this.search = mockSearch
		this.index = mockIndex
		this.update = mockUpdate
	})

	return {
		mockCount,
		mockExists,
		mockPing,
		mockSearch,
		mockCreate,
		mockIndex,
		mockRefresh,
		mockUpdate,
		mockDelete,
		mockLogInfo,
		ClientCtor,
	}
})

vi.mock('@elastic/elasticsearch', () => ({
	Client: ClientCtor,
}))

vi.mock('~/lib/util', () => ({
	log: { info: mockLogInfo },
}))

import { SearchClient } from './SearchClient'

describe('lib/util/search/SearchClient', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	describe('constructor', () =>
	{
		it('should store the index and instantiate the ES client', () =>
		{
			const client = new SearchClient('my-index')

			expect(client.getIndex()).toBe('my-index')
			expect(ClientCtor).toHaveBeenCalled()
		})

		it('should merge user options over defaults', () =>
		{
			new SearchClient('idx', { node: 'http://es:9200', maxRetries: 1 })

			const opts = ClientCtor.mock.calls.at(-1)?.[0] as { node: string; maxRetries: number }
			expect(opts.node).toBe('http://es:9200')
			expect(opts.maxRetries).toBe(1)
		})
	})

	describe('index accessors', () =>
	{
		it('getSource should return the underlying ES client', () =>
		{
			const client = new SearchClient('idx')
			expect(client.getSource()).toBeDefined()
		})

		it('setIndex should change the active index', () =>
		{
			const client = new SearchClient('a')
			client.setIndex('b')
			expect(client.getIndex()).toBe('b')
		})
	})

	describe('count', () =>
	{
		it('should return the count from the ES response', async () =>
		{
			mockCount.mockResolvedValue({ body: { count: 42 } })

			const client = new SearchClient('idx')
			expect(await client.count()).toBe(42)
			expect(mockCount).toHaveBeenCalledWith({ index: 'idx', body: {} })
		})
	})

	describe('indexExists / ping', () =>
	{
		it('indexExists returns true when ES responds 200', async () =>
		{
			mockExists.mockResolvedValue({ statusCode: 200 })

			const client = new SearchClient('idx')
			expect(await client.indexExists()).toBe(true)
		})

		it('indexExists returns false on non-200', async () =>
		{
			mockExists.mockResolvedValue({ statusCode: 404 })

			const client = new SearchClient('idx')
			expect(await client.indexExists()).toBe(false)
		})

		it('ping returns true on 200', async () =>
		{
			mockPing.mockResolvedValue({ statusCode: 200 })

			const client = new SearchClient('idx')
			expect(await client.ping()).toBe(true)
		})
	})

	describe('search', () =>
	{
		it('should remap ES hits into the SearchResult envelope', async () =>
		{
			mockSearch.mockResolvedValue({
				body: {
					hits: {
						max_score: 1.23,
						hits: [
							{ _id: 'a', _index: 'idx', _type: '_doc', _score: 1.0, _source: { v: 1 } },
							{ _id: 'b', _index: 'idx', _type: '_doc', _score: 0.5, _source: { v: 2 } },
						],
					},
				},
			})

			const client = new SearchClient('idx')
			const result = await client.search<{ v: number }>({ query: { match_all: {} } })

			expect(result.count).toBe(2)
			expect(result.maxScore).toBe(1.23)
			expect(result.data).toEqual([
				{ id: 'a', index: 'idx', type: '_doc', score: 1.0, source: { v: 1 } },
				{ id: 'b', index: 'idx', type: '_doc', score: 0.5, source: { v: 2 } },
			])
		})
	})

	describe('add', () =>
	{
		it('should throw when the index does not exist', async () =>
		{
			mockExists.mockResolvedValue({ statusCode: 404 })

			const client = new SearchClient('idx')
			await expect(client.add('id1', { v: 1 })).rejects.toThrow(/Missing index/)
		})

		it('should return true on a 201/created response', async () =>
		{
			mockExists.mockResolvedValue({ statusCode: 200 })
			mockIndex.mockResolvedValue({ statusCode: 201, body: { result: 'created' } })

			const client = new SearchClient('idx')
			expect(await client.add('id1', { v: 1 })).toBe(true)
		})

		it('should return false on any non-created result', async () =>
		{
			mockExists.mockResolvedValue({ statusCode: 200 })
			mockIndex.mockResolvedValue({ statusCode: 200, body: { result: 'updated' } })

			const client = new SearchClient('idx')
			expect(await client.add('id1', { v: 1 })).toBe(false)
		})
	})

	describe('refresh / deleteIndex', () =>
	{
		it('refresh returns true on 200', async () =>
		{
			mockRefresh.mockResolvedValue({ statusCode: 200 })

			const client = new SearchClient('idx')
			expect(await client.refresh()).toBe(true)
		})

		it('deleteIndex returns true on 200+acknowledged', async () =>
		{
			mockDelete.mockResolvedValue({ statusCode: 200, body: { acknowledged: true } })

			const client = new SearchClient('idx')
			expect(await client.deleteIndex()).toBe(true)
		})

		it('deleteIndex returns false when not acknowledged', async () =>
		{
			mockDelete.mockResolvedValue({ statusCode: 200, body: { acknowledged: false } })

			const client = new SearchClient('idx')
			expect(await client.deleteIndex()).toBe(false)
		})
	})

	describe('update', () =>
	{
		it('returns true on updated', async () =>
		{
			mockUpdate.mockResolvedValue({ statusCode: 200, body: { result: 'updated' } })

			const client = new SearchClient('idx')
			expect(await client.update('id1', { v: 2 })).toBe(true)
		})

		it('logs info and returns false on noop', async () =>
		{
			mockUpdate.mockResolvedValue({ statusCode: 200, body: { result: 'noop' } })

			const client = new SearchClient('idx')
			const ok = await client.update('id1', { v: 2 })

			expect(ok).toBe(false)
			expect(mockLogInfo).toHaveBeenCalled()
		})
	})

	describe('static createIndex', () =>
	{
		it('should construct its own ES client and return true on 200', async () =>
		{
			mockCreate.mockResolvedValue({ statusCode: 200 })

			const ok = await SearchClient.createIndex('new-idx', { title: { type: 'text' } })
			expect(ok).toBe(true)
			expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ index: 'new-idx' }))
		})
	})
})
