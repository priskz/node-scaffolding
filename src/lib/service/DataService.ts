import { Repository } from '~/lib/domain/Repository'

export class DataService<Entity> {
	/*
	 * Repository
	 */
	protected repository: Repository<Entity>

	/*
	 * Construct
	 */
	constructor(repository: Repository<Entity>) {
		this.repository = repository
	}

	/*
	 * Get
	 */
	public async get(
		data = {},
		count = false
	): Promise<Entity | Entity[] | undefined> {
		return await await this.get(data, count)
	}

	/*
	 * Get
	 */
	public async getOne(id: string | number): Promise<Entity | undefined> {
		return await this.getOne(id)
	}

	/*
	 * Create
	 */
	public async create(data: {}): Promise<Entity | undefined> {
		return await this.repository.create(data)
	}

	/*
	 * Update
	 */
	public async update(data: {}): Promise<Entity | undefined> {
		return await this.repository.update(data)
	}

	/*
	 * Delete
	 */
	public async delete(id: number | string): Promise<any> {
		return await this.repository.delete(id)
	}
}
