import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRefresh, mockFind, mockUpdate, mockGetIndex, mockGetSource } = vi.hoisted(() => ({
	mockRefresh: vi.fn(),
	mockFind: vi.fn(),
	mockUpdate: vi.fn(),
	mockGetIndex: vi.fn(() => 'test-index'),
	mockGetSource: vi.fn(() => ({ esClient: true })),
}))

vi.mock('./SearchClient', () => ({
	SearchClient: class
	{
		public refresh() { return mockRefresh() }
		public search<T>(body: unknown, options: unknown) { return mockFind(body, options) as Promise<T> }
		public update(id: string, data: unknown) { return mockUpdate(id, data) }
		public getIndex() { return mockGetIndex() }
		public getSource() { return mockGetSource() }
	},
}))

import { DefaultSearch } from './DefaultSearch'

describe('lib/util/search/DefaultSearch', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should default the index to "default-index"', () =>
	{
		const search = new DefaultSearch()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((search as any).index).toBe('default-index')
	})

	it('should honor options.index', () =>
	{
		const search = new DefaultSearch({ index: 'users' })
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((search as any).index).toBe('users')
	})

	it('refresh delegates to the underlying client', async () =>
	{
		mockRefresh.mockResolvedValue(true)

		const search = new DefaultSearch({ index: 'x' })
		expect(await search.refresh()).toBe(true)
		expect(mockRefresh).toHaveBeenCalled()
	})

	it('find delegates to client.search', async () =>
	{
		const result = { count: 0, maxScore: null, data: [] }
		mockFind.mockResolvedValue(result)

		const search = new DefaultSearch({ index: 'x' })
		const body = { query: { match_all: {} } }
		const options = { from: 0, size: 10 }

		expect(await search.find(body, options)).toBe(result)
		expect(mockFind).toHaveBeenCalledWith(body, options)
	})

	it('update delegates to client.update with id as string', async () =>
	{
		mockUpdate.mockResolvedValue(true)

		const search = new DefaultSearch({ index: 'x' })
		await search.update(42, { v: 1 })

		expect(mockUpdate).toHaveBeenCalledWith('42', { v: 1 })
	})

	it('getClient returns the underlying SearchClient', () =>
	{
		const search = new DefaultSearch({ index: 'x' })
		expect(typeof search.getClient().getIndex).toBe('function')
	})

	it('getSource returns the ES source via the client', () =>
	{
		const search = new DefaultSearch({ index: 'x' })
		expect(search.getSource()).toEqual({ esClient: true })
	})
})
