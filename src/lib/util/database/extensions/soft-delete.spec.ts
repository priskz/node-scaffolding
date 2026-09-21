import { describe, it, expect } from 'vitest'
import { applySoftDeleteFilter } from './soft-delete'

describe('lib/util/database/extensions/soft-delete', () =>
{
	describe('applySoftDeleteFilter', () =>
	{
		it('should add deletedAt null for soft-deletable models', () =>
		{
			// Init
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const args: any = { where: { name: 'Alice' } }

			// Action
			applySoftDeleteFilter('User', args)

			// Assert
			expect(args.where.deletedAt).toBeNull()
			expect(args.where.name).toBe('Alice')
		})

		it('should not add filter for non-soft-deletable models', () =>
		{
			// Init
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const args: any = { where: {} }

			// Action
			applySoftDeleteFilter('Event', args)

			// Assert
			expect(args.where).toEqual({})
			expect('deletedAt' in args.where).toBe(false)
		})

		it('should skip filter when deletedAt is already in where', () =>
		{
			// Init — withTrashed bypass uses deletedAt: undefined
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const args: any = { where: { deletedAt: undefined } }

			// Action
			applySoftDeleteFilter('User', args)

			// Assert — should not override the explicit deletedAt
			expect(args.where.deletedAt).toBeUndefined()
		})

		it('should skip filter when deletedAt has an explicit value', () =>
		{
			// Init — onlyTrashed uses deletedAt: { not: null }
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const args: any = { where: { deletedAt: { not: null } } }

			// Action
			applySoftDeleteFilter('User', args)

			// Assert
			expect(args.where.deletedAt).toEqual({ not: null })
		})

		it('should initialize where object when not present', () =>
		{
			// Init
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const args: any = {}

			// Action
			applySoftDeleteFilter('Session', args)

			// Assert
			expect(args.where).toEqual({ deletedAt: null })
		})

		it('should apply filter for all soft-deletable models', () =>
		{
			// Init
			const models = ['User', 'Session', 'Content', 'Category', 'Tag', 'Image']

			for(const model of models)
			{
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const args: any = { where: {} }

				// Action
				applySoftDeleteFilter(model, args)

				// Assert
				expect(args.where.deletedAt).toBeNull()
			}
		})

		it('should not apply filter for Tenant model', () =>
		{
			// Init
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const args: any = { where: {} }

			// Action
			applySoftDeleteFilter('Tenant', args)

			// Assert
			expect('deletedAt' in args.where).toBe(false)
		})
	})
})
