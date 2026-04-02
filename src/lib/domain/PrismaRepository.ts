import { PrismaClient } from '~/generated/prisma/client'
import { database } from '~/lib/util'
import { Query } from './types'

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
	 * Build where clause — soft delete filter
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

		// Soft delete filter
		if(this.softDeletes)
		{
			where.deletedAt = null
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
	 */
	public async findOneById(id: string | number): Promise<T | undefined> {
		// Build where
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const where: Record<string, any> = { id }

		// Soft delete filter
		if(this.softDeletes)
		{
			where.deletedAt = null
		}

		// Execute
		const result = await this.model.findFirst({
			where,
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
}
