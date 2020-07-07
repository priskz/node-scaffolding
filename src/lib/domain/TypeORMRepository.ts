import {
	DeleteResult,
	FindManyOptions,
	Repository,
	Not,
	LessThan,
	LessThanOrEqual,
	MoreThan,
	MoreThanOrEqual,
	Equal,
	Like,
	Between,
	In,
	Any,
	IsNull,
	Raw,
	SaveOptions
} from 'typeorm'
import { GetConfig } from './'

export class TypeORMRepository<T> {
	/*
	 * TypeORM Repository
	 */
	protected repository: Repository<T>

	/*
	 * Soft Delete (populates deletedAt instead of actual delete)
	 */
	protected softDeletes: boolean = false

	/*
	 * Eager loading configuration.
	 */
	protected eager = []

	/*
	 * Construct
	 */
	constructor(repository: Repository<T>, softDeletes = false) {
		this.repository = repository
		this.softDeletes = softDeletes
	}

	/*
	 * Get Entity
	 */
	public async get(config: GetConfig<T> = {}): Promise<T[]> {
		// Convert config into options
		const options = this._parseGetConfig(config)

		// Retrieve
		return await this.repository.find(options)
	}

	/*
	 * Get Entities with Count
	 */
	public async getWithCount(config: GetConfig<T> = {}): Promise<[T[], number]> {
		// Convert config into options
		const options = this._parseGetConfig(config)

		// Retrieve
		return await this.repository.findAndCount(options)
	}

	/*
	 * Get One Entity
	 */
	public async getOne(config: GetConfig<T> = {}): Promise<T | undefined> {
		// Convert config into options
		const options = this._parseGetConfig(config)

		// Retrieve
		return await this.repository.findOne({
			select: options.select,
			where: options.where,
			order: options.order,
			relations: options.relations,
			loadEagerRelations: options.loadEagerRelations
		})
	}

	/*
	 * Create Entity
	 */
	public async create(data: any): Promise<T | undefined> {
		// Attempt query
		return await this.repository.save(data)
	}

	/*
	 * Update Entity
	 */
	public async update(
		data: {},
		options: SaveOptions = {}
	): Promise<T | undefined> {
		// Save options
		const config = {
			data: undefined,
			listeners: true,
			transaction: true,
			chunk: undefined,
			reload: true,
			...options
		}

		// Attempt query
		return await this.repository.save(data, config)
	}

	/*
	 * Delete Entity
	 */
	public async delete(id: number | string): Promise<boolean> {
		// Init result
		let result

		// Attempt query
		if (this.softDeletes) {
			// Attempt
			result = await this.repository.softDelete(id)

			// Check if successful
			if (result.raw.affectedRows > 0) {
				return true
			}
		} else {
			// Attempt
			result = await this.repository.delete(id)

			// Check if successful
			if (result.affected && result.affected > 0) {
				return true
			}
		}

		// Failed
		return false
	}

	/*
	 * Determine if given an advanced where clause
	 */
	private _parseGetConfig(config: GetConfig<T>): FindManyOptions<T> {
		// Find Options
		let select: (keyof T)[] | undefined = undefined
		let order = {}
		let skip = 0
		let take = undefined
		let where = undefined
		let relations: string[] = this.eager
		let loadEagerRelations = relations.length > 0 ? true : false

		// Query config given?
		if (config.query) {
			// Set select params
			if (config.query.select) select = config.query.select

			// Set embed options
			if (config.query.embed) {
				// Iterate embed
				for (let i = 0; i < config.query.embed.length; i++) {
					// Add to
					relations.push(config.query.embed[i])
				}

				// Ensure to eager load if relations configured
				loadEagerRelations = relations.length > 0 ? true : false
			}

			// Set order options
			if (config.query.order) {
				order = config.query.order
			}

			// Add skip/take options
			if (config.query.take) {
				take = config.query.take
			}

			if (config.query.skip) {
				if (take) {
					skip = config.query.skip
				} else {
					throw Error('Offset Without Limit Not Supported Error')
				}
			}

			// Set where params
			if (config.query.where) {
				// Init
				let clause = []

				// If not array add to one
				if (!Array.isArray(config.query.where)) {
					clause.push(config.query.where)
				} else {
					clause = config.query.where
				}

				// Set where to empty array
				where = []

				// Iterate clauses
				for (let i = 0; i < clause.length; i++) {
					// Iterate clause object
					for (const [key, object] of Object.entries(clause[i])) {
						// Advanced whre?
						if (
							object.hasOwnProperty('value') &&
							object.hasOwnProperty('operator')
						) {
							//
							// Map operator to TypeOrm and add to clauses
							switch (object.operator) {
								case '!=':
									where.push({ [key]: Not(object.value) })
									break
								case '<>':
									where.push({ [key]: Not(object.value) })
									break
								case '<':
									where.push({ [key]: LessThan(object.value) })
									break
								case '<=':
									where.push({ [key]: LessThanOrEqual(object.value) })
									break
								case '>':
									where.push({ [key]: MoreThan(object.value) })
									break
								case '>=':
									where.push({ [key]: MoreThanOrEqual(object.value) })
									break
								case '=':
									where.push({ [key]: Equal(object.value) })
									break
								case 'LIKE':
									where.push({ [key]: Like(object.value) })
									break
								case 'BETWEEN':
									where.push({
										[key]: Between(object.value[0], object.value[1])
									})
									break
								case 'IN':
									where.push({ [key]: In(object.value) })
									break
								case 'IS NULL':
									where.push({ [key]: IsNull() })
									break
								case 'IS NOT NULL':
									where.push({ [key]: Not('null') })
									break
								case 'RAW':
									where.push({ [key]: Raw(object.value) })
									break
							}
						} else {
							// Add to clauses
							where.push(clause[i])
						}
					}
				}
			}
		}

		// Given eager value should be final say.
		if (config.loadEagerRelations) {
			loadEagerRelations = config.loadEagerRelations
		}

		// Build TypeORM option
		return {
			select,
			where,
			order,
			relations,
			loadEagerRelations,
			skip,
			take
		}
	}
}
