import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Mock database — Prisma client with test model
 */
const mockFindMany = vi.fn()
const mockFindFirst = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

vi.mock('~/lib/util', () => ({
	database: {
		client: () => ({
			testModel: {
				findMany: mockFindMany,
				findFirst: mockFindFirst,
				update: mockUpdate,
				delete: mockDelete,
			},
		}),
	},
}))

import { PrismaRepository } from './PrismaRepository'

class TestRepository extends PrismaRepository<{ id: string; name: string; deletedAt: Date | null }>
{
	constructor(softDeletes: boolean = false)
	{
		super()
		this.modelName = 'testModel'
		this.softDeletes = softDeletes
	}
}

describe('lib/domain/PrismaRepository', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	describe('instance creation', () =>
	{
		it('should create a repository instance with defaults', () =>
		{
			// Init
			const repo = new PrismaRepository()

			// Assert
			expect(repo).toBeInstanceOf(PrismaRepository)
		})
	})

	describe('buildInclude', () =>
	{
		it('should return undefined when no eager relations configured', () =>
		{
			// Init
			const repo = new PrismaRepository()

			// Action
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = (repo as any).buildInclude()

			// Assert
			expect(result).toBeUndefined()
		})
	})

	describe('buildWhere — withTrashed', () =>
	{
		it('should not add deletedAt when soft deletes disabled', () =>
		{
			// Init
			const repo = new TestRepository(false)

			// Action
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = (repo as any).buildWhere({})

			// Assert
			expect(result).toEqual({})
		})

		it('should add deletedAt undefined when withTrashed is true', () =>
		{
			// Init
			const repo = new TestRepository(true)

			// Action
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = (repo as any).buildWhere({ withTrashed: true })

			// Assert
			expect('deletedAt' in result).toBe(true)
			expect(result.deletedAt).toBeUndefined()
		})

		it('should not add deletedAt when withTrashed is false on soft-deletable repo', () =>
		{
			// Init
			const repo = new TestRepository(true)

			// Action
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = (repo as any).buildWhere({ withTrashed: false })

			// Assert — extension handles the filtering, not buildWhere
			expect('deletedAt' in result).toBe(false)
		})
	})

	describe('restore', () =>
	{
		it('should set deletedAt to null for soft-deletable repo', async () =>
		{
			// Init
			const repo = new TestRepository(true)
			const restored = { id: '1', name: 'Alice', deletedAt: null }
			mockUpdate.mockResolvedValue(restored)

			// Action
			const result = await repo.restore('1')

			// Assert
			expect(result).toEqual(restored)
			expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
				where: { id: '1' },
				data: { deletedAt: null },
			}))
		})

		it('should return undefined for non-soft-deletable repo', async () =>
		{
			// Init
			const repo = new TestRepository(false)

			// Action
			const result = await repo.restore('1')

			// Assert
			expect(result).toBeUndefined()
			expect(mockUpdate).not.toHaveBeenCalled()
		})
	})

	describe('forceDelete', () =>
	{
		it('should permanently delete regardless of soft delete setting', async () =>
		{
			// Init
			const repo = new TestRepository(true)
			mockDelete.mockResolvedValue({ id: '1' })

			// Action
			const result = await repo.forceDelete('1')

			// Assert
			expect(result).toBe(true)
			expect(mockDelete).toHaveBeenCalledWith({ where: { id: '1' } })
		})
	})
})
