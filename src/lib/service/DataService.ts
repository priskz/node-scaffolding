import { PrismaRepository } from '~/lib/domain'
import type {
	Query,
	PaginationQuery,
	PaginatedResult,
	CursorPaginationQuery,
	CursorPaginatedResult,
} from '~/lib/domain'

export class DataService<T> {
	/*
	 * Repository
	 */
	protected repository: PrismaRepository<T>

	/*
	 * Construct
	 */
	constructor(repository: PrismaRepository<T>) {
		this.repository = repository
	}

	/*
	 * Get
	 */
	public async get(query: Query<T> = {}): Promise<T[]> {
		// Execute
		return await this.repository.get(query)
	}

	/*
	 * Get With Count
	 */
	public async getWithCount(query: Query<T> = {}): Promise<[T[], number]> {
		// Execute
		return await this.repository.getWithCount(query)
	}

	/*
	 * Paginate — offset-based
	 */
	public async paginate(query: Query<T> = {}, pagination: PaginationQuery = {}): Promise<PaginatedResult<T>>
	{
		// Execute
		return await this.repository.paginate(query, pagination)
	}

	/*
	 * Cursor Paginate — cursor-based
	 */
	public async cursorPaginate(query: Query<T> = {}, pagination: CursorPaginationQuery = {}): Promise<CursorPaginatedResult<T>>
	{
		// Execute
		return await this.repository.cursorPaginate(query, pagination)
	}

	/*
	 * Get One
	 */
	public async getOne(query: Query<T> = {}): Promise<T | undefined> {
		// Execute
		return await this.repository.getOne(query)
	}

	/*
	 * Create
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async create(data: Record<string, any>): Promise<T | undefined> {
		// Execute
		return await this.repository.create(data)
	}

	/*
	 * Update
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async update(data: Record<string, any>): Promise<T | undefined> {
		// Execute
		return await this.repository.update(data)
	}

	/*
	 * Delete
	 */
	public async delete(id: number | string): Promise<boolean> {
		// Execute
		return await this.repository.delete(id)
	}

	/*
	 * Restore — undo a soft delete
	 */
	public async restore(id: number | string): Promise<T | undefined>
	{
		// Execute
		return await this.repository.restore(id)
	}

	/*
	 * Force Delete — permanent removal
	 */
	public async forceDelete(id: number | string): Promise<boolean>
	{
		// Execute
		return await this.repository.forceDelete(id)
	}
}
