import { getCustomRepository } from 'typeorm'
import { cache as GlobalCache, DefaultCache } from '~/lib/util'
import { Content, ContentRepository } from './'

export class ContentCache extends DefaultCache {
	/**
	 * Cache storage key prefix
	 */
	protected prefix = 'content'

	/**
	 * The _client storage bucket this should act upon
	 */
	protected bucket = 3

	/**
	 * Constructor
	 */
	constructor() {
		// Always use global cache client
		super({ client: GlobalCache.client() })
	}

	/**
	 * Fetch model from cache. Optionally, cache a fresh copy if it doesn't exist
	 */
	public async fetch(id: string, cache = true): Promise<Content | undefined> {
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
				await this.save(source)

				// Return uniform data by stringify and parsing rather than hitting cache
				return JSON.parse(JSON.stringify(source))
			}
		}
	}

	/**
	 * Save model in cache by given id
	 */
	public async saveById(id: string): Promise<boolean> {
		// Fresh content data to cache
		const content = await this.getSource(id)

		// Cant cache missing content
		if (!content) {
			return false
		}

		// Convert to JSON and set cache value
		return await this.set(content.id, JSON.stringify(content))
	}

	/**
	 * Save given Content in cache
	 */
	public async save(data: Content, refresh = false): Promise<boolean> {
		// Content data
		let content: Content = data

		// Retrieve fresh data if flagged
		if (refresh) {
			const source = await this.getSource(data.id.toString())

			if (source) {
				content = source
			} else {
				return false
			}
		}

		// Convert to JSON and set cache value
		return await this.set(content.id, JSON.stringify(content))
	}

	/**
	 * Get fresh model data from source
	 */
	public async getSource(id: string): Promise<Content | undefined> {
		// Init repository
		const repository = getCustomRepository(ContentRepository)

		// Attempt to find source
		return await repository.findOneById(id, {
			loadEagerRelations: true
		})
	}
}
