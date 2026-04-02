import { describe, it, expect, vi, beforeEach } from 'vitest'
import { transaction } from './transaction'
import { database } from './database'

describe('lib/util/database/transaction', () =>
{
	describe('transaction', () =>
	{
		it('should return success with data when callback succeeds', async () =>
		{
			// Init — mock the database client
			const mockTx = { user: { findMany: vi.fn().mockResolvedValue([]) } }
			const mock$transaction = vi.fn().mockImplementation(async (fn: Function) =>
			{
				return await fn(mockTx)
			})

			vi.spyOn(database, 'client').mockReturnValue({
				$transaction: mock$transaction
			} as any)

			// Action
			const result = await transaction(async (tx) =>
			{
				return { count: 42 }
			})

			// Assert
			expect(result.success).toBe(true)
			expect(result.data).toEqual({ count: 42 })
			expect(result.error).toBeUndefined()
		})

		it('should return failure with error when callback throws', async () =>
		{
			// Init
			const mock$transaction = vi.fn().mockRejectedValue(new Error('DB constraint violated'))

			vi.spyOn(database, 'client').mockReturnValue({
				$transaction: mock$transaction
			} as any)

			// Action
			const result = await transaction(async (tx) =>
			{
				throw new Error('DB constraint violated')
			})

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('DB constraint violated')
			expect(result.data).toBeUndefined()
		})
	})
})
