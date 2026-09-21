import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFind = vi.fn()
const mockUpdate = vi.fn()
const mockRefresh = vi.fn()
const mockUpdateByQuery = vi.fn()
const mockGetIndex = vi.fn(() => 'test-index')

vi.mock('~/lib/util', () =>
{
	class DefaultSearch
	{
		protected index: string
		constructor(options: { index?: string } = {})
		{
			this.index = options.index ?? 'default'
		}
		public find(...args: unknown[]) { return mockFind(...args) }
		public update(...args: unknown[]) { return mockUpdate(...args) }
		public refresh() { return mockRefresh() }
		public getClient() { return { getIndex: mockGetIndex } }
		public getSource() { return { updateByQuery: mockUpdateByQuery } }
	}

	return {
		DefaultSearch,
		log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
	}
})

import { ContentSearch } from './ContentSearch'

describe('app/domain/content/ContentSearch', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	describe('replace', () =>
	{
		it('should return false when the document is not indexed', async () =>
		{
			mockFind.mockResolvedValue({ data: [] })

			const search = new ContentSearch({ index: 'test-index' })
			const result = await search.replace('missing', { id: 'missing' } as never)

			expect(result).toBe(false)
			expect(mockUpdate).not.toHaveBeenCalled()
		})

		it('should return false when update fails', async () =>
		{
			mockFind.mockResolvedValue({ data: [{ source: { category: {}, tag: [] } }] })
			mockUpdate.mockResolvedValue(false)

			const search = new ContentSearch({ index: 'test-index' })
			const result = await search.replace('id1', { id: 'id1', category: {}, tag: [] } as never)

			expect(result).toBe(false)
		})

		it('should update, process references, refresh, and return true on success', async () =>
		{
			const existing = {
				source: {
					category: { id: 'c1', name: 'Old' },
					tag: [{ id: 't1', name: 'Original' }],
				},
			}
			mockFind.mockResolvedValue({ data: [existing] })
			mockUpdate.mockResolvedValue(true)
			mockRefresh.mockResolvedValue(true)
			mockUpdateByQuery.mockResolvedValue({
				statusCode: 200,
				body: {
					timed_out: false,
					took: 5,
					total: 0,
					updated: 0,
					batches: 1,
					version_conflicts: 0,
				},
			})

			const search = new ContentSearch({ index: 'test-index' })
			const content = {
				id: 'id1',
				category: { id: 'c1', name: 'New' },
				tag: [{ id: 't1', name: 'Original' }],
			} as never

			const result = await search.replace('id1', content)

			expect(result).toBe(true)
			expect(mockUpdate).toHaveBeenCalledWith('id1', content)
			expect(mockRefresh).toHaveBeenCalled()
		})

		it('should return true even when a reference update returns a non-200', async () =>
		{
			const existing = {
				source: {
					category: { id: 'c1', name: 'Old' },
					tag: [],
				},
			}
			mockFind.mockResolvedValue({ data: [existing] })
			mockUpdate.mockResolvedValue(true)
			mockRefresh.mockResolvedValue(true)
			mockUpdateByQuery.mockResolvedValue({ statusCode: 500, body: {} })

			const search = new ContentSearch({ index: 'test-index' })
			const result = await search.replace('id1', {
				id: 'id1',
				category: { id: 'c1', name: 'New' },
				tag: [],
			} as never)

			expect(result).toBe(true)
		})
	})

	describe('reference deltas', () =>
	{
		it('should skip reference update when reference value is unchanged', async () =>
		{
			const same = { id: 'c1', name: 'Same' }
			mockFind.mockResolvedValue({ data: [{ source: { category: same, tag: [] } }] })
			mockUpdate.mockResolvedValue(true)
			mockRefresh.mockResolvedValue(true)

			const search = new ContentSearch({ index: 'test-index' })
			await search.replace('id1', {
				id: 'id1',
				category: { ...same },
				tag: [],
			} as never)

			expect(mockUpdateByQuery).not.toHaveBeenCalled()
		})
	})
})
