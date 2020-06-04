import {
	DeleteResult,
	FindManyOptions,
	FindOneOptions,
	ObjectID,
	Repository
} from 'typeorm'

export class TypeORMRepository<Entity> {
	/**
	 * TypeORM Repository
	 */
	protected repository: Repository<Entity>

	/**
	 * Soft Delete (populate deletedAt instead of actual delete)
	 */
	protected softDeletes: boolean = false

	/**
	 * Eager loading configuration. Note: This is good for loading
	 * relationships that are statically assigned.
	 */
	protected eager = []

	/**
	 * Construct
	 */
	constructor(repository: Repository<Entity>) {
		this.repository = repository
	}

	// (<Entity>

	/*
	 * Get Entity
	 */
	public async get(
		options?: FindManyOptions,
		count?: boolean
	): Promise<Entity[] | [Entity[], number]> {
		// Init
		let result

		// Show count?
		if (count) {
			result = await this.repository.findAndCount(options)
		} else {
			result = await this.repository.find(options)
		}

		return result
	}

	/*
	 * Get One Entity
	 */
	public async getOne(
		id?: string | number | Date | ObjectID | undefined,
		options?: FindOneOptions<Entity> | undefined
	): Promise<Entity | undefined> {
		return await this.repository.findOne(id, options)
	}

	/**
	 * Create Entity
	 */
	public async create(data: any): Promise<Entity | undefined> {
		// Init result
		let result

		// Attempt query
		try {
			result = await this.repository.save(data)
		} catch (error) {
			console.log(error)
		}

		return result
	}

	/*
	 * Update Entity
	 */
	public async update(data: {}): Promise<Entity | undefined> {
		// Init result
		let result

		// Attempt query
		try {
			result = await this.repository.save(data)
		} catch (error) {
			console.log(error)
		}

		return result
	}

	/*
	 * Delete Entity
	 */
	public async delete(id: number | string): Promise<DeleteResult | undefined> {
		// Init result
		let result

		// Attempt query
		try {
			if (this.softDeletes) {
				result = await this.repository.softDelete(id)
			} else {
				result = await this.repository.delete(id)
			}
		} catch (error) {
			console.log(error)
		}

		return result
	}
}
