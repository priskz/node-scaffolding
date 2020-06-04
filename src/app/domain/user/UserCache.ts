import { DefaultCache } from '~/lib/util'
import { User } from './User'

export class UserCache extends DefaultCache {
	/**
	 * Fetch model from cache. Optionally, cache a fresh copy if it doesn't exist
	 */
	public async fetch(id: number, cache = true): Promise<{} | undefined> {
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

	/**
	 * Save model in cache by given id
	 */
	public async saveById(id: number): Promise<void> {
		// Fresh user data to cache
		const user = await this.getSource(id)

		// Convert to JSON and set cache value
		if (user) await this.set(user.id, JSON.stringify(user))
	}

	/**
	 * Save given model in cache
	 */
	public async save(data: User, refresh = false): Promise<void> {
		// User data
		let user: User = data

		// Retrieve fresh data if flagged
		if (refresh) {
			const sourceUser = await this.getSource(data.id)

			if (sourceUser) user = sourceUser
		}

		// Convert to JSON and set cache value
		await this.set(user.id, JSON.stringify(user))
	}

	/**
	 * Get fresh model data from source
	 */
	public async getSource(id: number): Promise<User | undefined> {
		// Find user source data
		return await User.findOne(id, {
			where: { id: id },
			relations: [],
			loadEagerRelations: true
		})
	}
}
