import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Mock database — Prisma client with test model
 */
const mockFindMany = vi.fn()
const mockCount = vi.fn()

vi.mock('~/lib/util', () => ({
	database: {
		client: () => ({
			testModel: {
				findMany: mockFindMany,
				count: mockCount,
			},
		}),
	},
}))

import { PrismaRepository } from './PrismaRepository'

class TestRepository extends PrismaRepository<{ id: string; name: string }>
{
	constructor()
	{
		super()
		this.modelName = 'testModel'
	}
}

describe('lib/domain/PrismaRepository — pagination', () =>
{
	let repo: TestRepository

	beforeEach(() =>
	{
		repo = new TestRepository()
		vi.clearAllMocks()
	})

	describe('paginate — offset-based', () =>
	{
		it('should return first page with correct meta', async () =>
		{
			// Init
			const records = [
				{ id: '1', name: 'Alice' },
				{ id: '2', name: 'Bob' },
			]
			mockFindMany.mockResolvedValue(records)
			mockCount.mockResolvedValue(5)

			// Action
			const result = await repo.paginate({}, { page: 1, perPage: 2 })

			// Assert
			expect(result.data).toEqual(records)
			expect(result.meta).toEqual({
				page: 1,
				perPage: 2,
				total: 5,
				totalPages: 3,
				hasNext: true,
				hasPrev: false,
			})
			expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
				skip: 0,
				take: 2,
			}))
		})

		it('should return last page with correct meta', async () =>
		{
			// Init
			mockFindMany.mockResolvedValue([{ id: '5', name: 'Eve' }])
			mockCount.mockResolvedValue(5)

			// Action
			const result = await repo.paginate({}, { page: 3, perPage: 2 })

			// Assert
			expect(result.meta.hasNext).toBe(false)
			expect(result.meta.hasPrev).toBe(true)
			expect(result.meta.totalPages).toBe(3)
			expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
				skip: 4,
				take: 2,
			}))
		})

		it('should use defaults when no pagination params provided', async () =>
		{
			// Init
			mockFindMany.mockResolvedValue([])
			mockCount.mockResolvedValue(0)

			// Action
			const result = await repo.paginate()

			// Assert
			expect(result.meta.page).toBe(1)
			expect(result.meta.perPage).toBe(25)
			expect(result.meta.total).toBe(0)
			expect(result.meta.totalPages).toBe(0)
			expect(result.meta.hasNext).toBe(false)
			expect(result.meta.hasPrev).toBe(false)
		})

		it('should return empty data with zero total', async () =>
		{
			// Init
			mockFindMany.mockResolvedValue([])
			mockCount.mockResolvedValue(0)

			// Action
			const result = await repo.paginate({}, { page: 1, perPage: 10 })

			// Assert
			expect(result.data).toEqual([])
			expect(result.meta.total).toBe(0)
			expect(result.meta.totalPages).toBe(0)
		})

		it('should pass where clause and order to query', async () =>
		{
			// Init
			mockFindMany.mockResolvedValue([])
			mockCount.mockResolvedValue(0)

			// Action
			await repo.paginate(
				{ where: { name: 'Alice' }, order: { name: 'ASC' } },
				{ page: 2, perPage: 10 },
			)

			// Assert
			expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
				where: { name: 'Alice' },
				orderBy: { name: 'ASC' },
				skip: 10,
				take: 10,
			}))
			expect(mockCount).toHaveBeenCalledWith({ where: { name: 'Alice' } })
		})
	})

	describe('cursorPaginate — cursor-based', () =>
	{
		it('should return first page when no cursor provided', async () =>
		{
			// Init
			const records = [
				{ id: '1', name: 'Alice' },
				{ id: '2', name: 'Bob' },
				{ id: '3', name: 'Charlie' },
			]
			mockFindMany.mockResolvedValue(records)

			// Action
			const result = await repo.cursorPaginate({}, { limit: 2 })

			// Assert — fetched 3 (limit + 1), returned 2
			expect(result.data).toHaveLength(2)
			expect(result.meta.hasNext).toBe(true)
			expect(result.meta.nextCursor).toBe('2')
			expect(result.meta.limit).toBe(2)
		})

		it('should apply cursor and skip the cursor record', async () =>
		{
			// Init
			const records = [{ id: '4', name: 'Diana' }]
			mockFindMany.mockResolvedValue(records)

			// Action
			const result = await repo.cursorPaginate({}, { cursor: '3', limit: 2 })

			// Assert
			expect(result.data).toHaveLength(1)
			expect(result.meta.hasNext).toBe(false)
			expect(result.meta.nextCursor).toBe('4')
			expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
				cursor: { id: '3' },
				skip: 1,
				take: 3,
			}))
		})

		it('should return empty data with no nextCursor', async () =>
		{
			// Init
			mockFindMany.mockResolvedValue([])

			// Action
			const result = await repo.cursorPaginate({}, { cursor: '99', limit: 10 })

			// Assert
			expect(result.data).toEqual([])
			expect(result.meta.hasNext).toBe(false)
			expect(result.meta.nextCursor).toBeUndefined()
		})

		it('should use default limit of 25 when not specified', async () =>
		{
			// Init
			mockFindMany.mockResolvedValue([])

			// Action
			const result = await repo.cursorPaginate()

			// Assert
			expect(result.meta.limit).toBe(25)
			expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
				take: 26,
			}))
		})

		it('should use default id ordering when no order specified', async () =>
		{
			// Init
			mockFindMany.mockResolvedValue([])

			// Action
			await repo.cursorPaginate()

			// Assert
			expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
				orderBy: { id: 'asc' },
			}))
		})
	})
})
