import { TypeORMRepository as Repository, Query } from '~/lib/domain'

export class DataService<T> {
	/*
	 * Repository
	 */
	protected repository: Repository<T>

	/*
	 * Construct
	 */
	constructor(repository: Repository<T>) {
		this.repository = repository
	}

	/*
	 * Get
	 */
	public async get(query: Query<T> = {}): Promise<T[]> {
		// Execute and return result
		return await this.repository.get({ query })
	}

	/*
	 * Get
	 */
	public async getWithCount(query: Query<T> = {}): Promise<[T[], number]> {
		// Execute and return result
		return await this.repository.getWithCount({ query })
	}

	/*
	 * Get One
	 */
	public async getOne(query: Query<T> = {}): Promise<T | undefined> {
		return await this.repository.getOne({ query })
	}

	/*
	 * Create
	 */
	public async create(data: {}): Promise<T | undefined> {
		return await this.repository.create(data)
	}

	/*
	 * Update
	 */
	public async update(data: {}): Promise<T | undefined> {
		return await this.repository.update(data)
	}

	/*
	 * Delete
	 */
	public async delete(id: number | string): Promise<any> {
		return await this.repository.delete(id)
	}
}
