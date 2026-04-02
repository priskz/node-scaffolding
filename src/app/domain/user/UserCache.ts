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
		if(data) {
			return JSON.parse(data)
		}

		// Cache it now?
		if(cache) {
			// Find fresh source
			const source = await this.getSource(id)

			// Found?
			if(source) {
				// Add to cache
				await this.save(source)

				// Return
				return JSON.parse(JSON.stringify(source))
			}
		}
	}

	/*
	 * Save model in cache by given id
	 */
	public async saveById(id: number): Promise<boolean> {
		// Fresh data
		const user = await this.getSource(id)

		// Not found?
		if( ! user) return false

		// Cache
		return await this.set(user.id, JSON.stringify(user))
	}

	/*
	 * Save given model in cache
	 */
	public async save(data: User, refresh = false): Promise<boolean> {
		// Init
		let user: User = data

		// Refresh?
		if(refresh) {
			const source = await this.getSource(data.id)

			if(source) {
				user = source
			} else {
				return false
			}
		}

		// Cache
		return await this.set(user.id, JSON.stringify(user))
	}

	/*
	 * Get fresh model data from source
	 */
	public async getSource(id: number): Promise<User | undefined> {
		// Init repo
		const repository = new UserRepository()

		// Find
		return await repository.findOneById(id)
	}
}
