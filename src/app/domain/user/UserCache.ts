import { getCustomRepository } from 'typeorm'
import { cache as GlobalCache, DefaultCache } from '~/lib/util'
import { User, UserRepository } from './'

export class UserCache extends DefaultCache {
	/*
	 * Cache storage key prefix
	 */
	protected prefix = 'user'

	/*
	 * The _client storage bucket this should act upon
	 */
	protected bucket = 1

	/*
	 * Constructor
	 */
	constructor() {
		// Always use global cache client
		super({ client: GlobalCache.client() })
	}

	/*
	 * Fetch model from cache. Optionally, cache a fresh copy if it doesn't exist
	 */
	public async fetch(id: number, cache = true): Promise<User | undefined> {
		// Find in cache
		const data = await this.getRaw(id)

		// Found?
		if (data) {
			return JSON.parse(data)
		}

		// Didn't exist in cache, so cache it now, and return
		if (cache) {
			// Find fresh source value
			const source = await this.getSource(id)

			// Convert to JSON and set cache value
			if (source) {
				// Add to cache
				await await this.save(source)

				// Return uniform data by stringify and parsing rather than hitting cache
				return JSON.parse(JSON.stringify(source))
			}
		}
	}

	/*
	 * Save model in cache by given id
	 */
	public async saveById(id: number): Promise<boolean> {
		// Fresh user data to cache
		const user = await this.getSource(id)

		// Cant cache missing user
		if (!user) {
			return false
		}

		// Convert to JSON and set cache value
		return await this.set(user.id, JSON.stringify(user))
	}

	/*
	 * Save given model in cache
	 */
	public async save(data: User, refresh = false): Promise<boolean> {
		// User data
		let user: User = data

		// Retrieve fresh data if flagged
		if (refresh) {
			const source = await this.getSource(data.id)

			if (source) {
				user = source
			} else {
				return false
			}
		}

		// Convert to JSON and set cache value
		return await this.set(user.id, JSON.stringify(user))
	}

	/*
	 * Get fresh model data from source
	 */
	public async getSource(id: number): Promise<User | undefined> {
		// Init repo
		const repository = getCustomRepository(UserRepository)

		// Find user source data
		return await repository.findOneById(id, {
			where: { id: id },
			relations: ['session'],
			loadEagerRelations: true
		})
	}
}
