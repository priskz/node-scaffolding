import { describe, it, expect } from 'vitest'
import { PrismaRepository } from './PrismaRepository'

describe('lib/domain/PrismaRepository', () =>
{
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
			const result = (repo as any).buildInclude()

			// Assert
			expect(result).toBeUndefined()
		})
	})

	describe('buildWhere with soft deletes', () =>
	{
		it('should add deletedAt null filter when soft deletes enabled', () =>
		{
			// Init
			const repo = new PrismaRepository()
			;(repo as any).softDeletes = true

			// Action
			const result = (repo as any).buildWhere({})

			// Assert
			expect(result).toEqual({ deletedAt: null })
		})

		it('should not add deletedAt filter when soft deletes disabled', () =>
		{
			// Init
			const repo = new PrismaRepository()

			// Action
			const result = (repo as any).buildWhere({})

			// Assert
			expect(result).toEqual({})
		})
	})
})
