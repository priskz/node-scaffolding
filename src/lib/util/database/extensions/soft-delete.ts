import type { PrismaClient } from '~/generated/prisma/client'

/*
 * Models with soft delete support
 *
 * Any model with a `deletedAt` column is eligible.
 * The extension automatically filters soft-deleted records
 * on reads — no manual logic needed at the repository level.
 */
const SOFT_DELETABLE_MODELS: string[] = [
	'User',
	'Session',
	'Content',
	'Category',
	'Tag',
	'Image',
]

/*
 * Apply soft delete query interceptors
 *
 * Wraps findMany, findFirst, findUnique, and count to
 * automatically filter out soft-deleted records.
 *
 * To bypass the filter — include `deletedAt` in the where clause:
 *   { where: { deletedAt: undefined } } — returns all records (withTrashed)
 *   { where: { deletedAt: { not: null } } } — only soft-deleted records
 */
export function withSoftDeletes(prisma: PrismaClient): PrismaClient
{
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (prisma as any).$extends({
		query: {
			$allModels: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				async findMany({ model, args, query }: any)
				{
					applySoftDeleteFilter(model, args)
					return query(args)
				},
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				async findFirst({ model, args, query }: any)
				{
					applySoftDeleteFilter(model, args)
					return query(args)
				},
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				async findUnique({ model, args, query }: any)
				{
					applySoftDeleteFilter(model, args)
					return query(args)
				},
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				async count({ model, args, query }: any)
				{
					applySoftDeleteFilter(model, args)
					return query(args)
				},
			},
		},
	}) as unknown as PrismaClient
}

/*
 * Apply deletedAt filter if model supports soft deletes
 * and deletedAt is not already in the where clause
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applySoftDeleteFilter(model: string, args: any): void
{
	// Not a soft-deletable model?
	if( ! SOFT_DELETABLE_MODELS.includes(model)) return

	// Init where
	if( ! args.where) args.where = {}

	// Already filtering on deletedAt? — caller has explicit intent
	if('deletedAt' in args.where) return

	// Apply soft delete filter
	args.where.deletedAt = null
}
