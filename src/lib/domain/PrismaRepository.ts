import { PrismaClient } from '~/generated/prisma/client'
import { database } from '~/lib/util'
import type {
	Query,
	PaginationQuery,
	PaginationMeta,
	PaginatedResult,
	CursorPaginationQuery,
	CursorPaginationMeta,
	CursorPaginatedResult,
} from './types'

/*
 * Prisma Repository Base
 *
 * Thin wrapper providing a consistent interface per entity.
 * Subclasses set the model name. Simple CRUD goes through here.
 * Complex queries get named methods in the subclass.
 */
export class PrismaRepository<T> {
	/*
	 * Prisma model delegate name
	 */
	protected modelName: string = ''

	/*
	 * Soft deletes enabled
	 */
	protected softDeletes: boolean = false

	/*
	 * Eager loading relations
	 */
	protected eager: string[] = []

	/*
	 * Get Prisma Client
	 */
	protected get prisma(): PrismaClient {
		return database.client()
	}

	/*
	 * Get model delegate
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected get model(): any {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (this.prisma as any)[this.modelName]
	}

	/*
	 * Build include object from eager array
	 */
	protected buildInclude(): Record<string, boolean> | undefined {
		// No eager?
		if(this.eager.length === 0) return undefined

		// Build include
		const include: Record<string, boolean> = {}

		for(const relation of this.eager)
		{
			include[relation] = true
		}

		return include
	}

	/*
	 * Build where clause
	 *
	 * Soft delete filtering is handled by the Prisma client extension.
	 * When withTrashed is set, deletedAt: undefined signals the extension
	 * to skip filtering — Prisma ignores undefined values in where clauses.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected buildWhere(query: Query<T> = {}): Record<string, any> {
		// Init
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const where: Record<string, any> = {}

		// Apply query where
		if(query.where && ! Array.isArray(query.where))
		{
			Object.assign(where, query.where)
		}

		// Bypass soft delete extension?
		if(query.withTrashed && this.softDeletes)
		{
			where.deletedAt = undefined
		}

		return where
	}

	/*
	 * Build order clause
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected buildOrderBy(query: Query<T> = {}): Record<string, any> | undefined {
		// No order?
		if( ! query.order) return undefined

		return query.order as Record<string, string>
	}

	/*
	 * Find many
	 */
	public async get(query: Query<T> = {}): Promise<T[]> {
		// Build args
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const args: Record<string, any> = {
			where: this.buildWhere(query),
			include: this.buildInclude(),
			orderBy: this.buildOrderBy(query)
		}

		// Pagination
		if(query.take) args.take = query.take
		if(query.skip) args.skip = query.skip

		// Execute
		return await this.model.findMany(args)
	}

	/*
	 * Find many with count
	 */
	public async getWithCount(query: Query<T> = {}): Promise<[T[], number]> {
		// Build args
		const where = this.buildWhere(query)
		const include = this.buildInclude()
		const orderBy = this.buildOrderBy(query)

		// Execute in parallel
		const [data, count] = await Promise.all([
			this.model.findMany({
				where,
				include,
				orderBy,
				take: query.take,
				skip: query.skip
			}),
			this.model.count({ where })
		])

		return [data, count]
	}

	/*
	 * Paginate — offset-based
	 */
	public async paginate(query: Query<T> = {}, pagination: PaginationQuery = {}): Promise<PaginatedResult<T>>
	{
		// Defaults
		const page = pagination.page ?? 1
		const perPage = pagination.perPage ?? 25

		// Build args
		const where = this.buildWhere(query)
		const include = this.buildInclude()
		const orderBy = this.buildOrderBy(query)

		// Execute in parallel
		const [data, total] = await Promise.all([
			this.model.findMany({
				where,
				include,
				orderBy,
				skip: (page - 1) * perPage,
				take: perPage,
			}),
			this.model.count({ where }),
		])

		// Build meta
		const totalPages = Math.ceil(total / perPage)
		const meta: PaginationMeta = {
			page,
			perPage,
			total,
			totalPages,
			hasNext: page < totalPages,
			hasPrev: page > 1,
		}

		return { data, meta }
	}

	/*
	 * Cursor Paginate — cursor-based
	 */
	public async cursorPaginate(query: Query<T> = {}, pagination: CursorPaginationQuery = {}): Promise<CursorPaginatedResult<T>>
	{
		// Defaults
		const limit = pagination.limit ?? 25

		// Build args
		const where = this.buildWhere(query)
		const include = this.buildInclude()
		const orderBy = this.buildOrderBy(query) ?? { id: 'asc' }

		// Cursor args
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const args: Record<string, any> = {
			where,
			include,
			orderBy,
			take: limit + 1,
		}

		// Apply cursor
		if(pagination.cursor)
		{
			args.cursor = { id: pagination.cursor }
			args.skip = 1
		}

		// Execute
		const results: T[] = await this.model.findMany(args)

		// Determine boundaries
		const hasNext = results.length > limit
		const data = hasNext ? results.slice(0, limit) : results

		// Build meta
		const meta: CursorPaginationMeta = {
			limit,
			hasNext,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			nextCursor: data.length > 0 ? (data[data.length - 1] as any).id : undefined,
		}

		return { data, meta }
	}

	/*
	 * Find one
	 */
	public async getOne(query: Query<T> = {}): Promise<T | undefined> {
		// Execute
		const result = await this.model.findFirst({
			where: this.buildWhere(query),
			include: this.buildInclude()
		})

		// Return
		return result ?? undefined
	}

	/*
	 * Find one by ID
	 *
	 * Soft delete filtering handled by Prisma client extension.
	 */
	public async findOneById(id: string | number): Promise<T | undefined> {
		// Execute
		const result = await this.model.findFirst({
			where: { id },
			include: this.buildInclude()
		})

		// Return
		return result ?? undefined
	}

	/*
	 * Create
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async create(data: Record<string, any>): Promise<T | undefined> {
		// Execute
		const result = await this.model.create({
			data,
			include: this.buildInclude()
		})

		// Return
		return result ?? undefined
	}

	/*
	 * Update
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async update(data: Record<string, any>): Promise<T | undefined> {
		// Extract id
		const { id, ...updateData } = data

		// No id?
		if( ! id) return undefined

		// Execute
		const result = await this.model.update({
			where: { id },
			data: updateData,
			include: this.buildInclude()
		})

		// Return
		return result ?? undefined
	}

	/*
	 * Delete
	 */
	public async delete(id: number | string): Promise<boolean> {
		// Soft delete?
		if(this.softDeletes)
		{
			await this.model.update({
				where: { id },
				data: { deletedAt: new Date() }
			})

			return true
		}

		// Hard delete
		await this.model.delete({ where: { id } })

		return true
	}

	/*
	 * Restore — undo a soft delete
	 */
	public async restore(id: number | string): Promise<T | undefined>
	{
		// Not soft-deletable?
		if( ! this.softDeletes) return undefined

		// Execute
		const result = await this.model.update({
			where: { id },
			data: { deletedAt: null },
			include: this.buildInclude(),
		})

		return result ?? undefined
	}

	/*
	 * Force Delete — permanent removal regardless of soft delete setting
	 */
	public async forceDelete(id: number | string): Promise<boolean>
	{
		await this.model.delete({ where: { id } })
		return true
	}
}
