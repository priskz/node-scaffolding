import { cache as GlobalCache, DefaultCache } from '~/lib/util'
import { Content, ContentRepository } from './'

export class ContentCache extends DefaultCache {
	/*
	 * Cache storage key prefix
	 */
	protected prefix = 'content'

	/*
	 * The _client storage bucket this should act upon
	 */
	protected bucket = 3

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
	public async fetch(id: string, cache = true): Promise<Content | undefined> {
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
	public async saveById(id: string): Promise<boolean> {
		// Fresh data
		const content = await this.getSource(id)

		// Not found?
		if( ! content) return false

		// Cache
		return await this.set(content.id, JSON.stringify(content))
	}

	/*
	 * Save given Content in cache
	 */
	public async save(data: Content, refresh = false): Promise<boolean> {
		// Init
		let content: Content = data

		// Refresh?
		if(refresh) {
			const source = await this.getSource(data.id.toString())

			if(source) {
				content = source
			} else {
				return false
			}
		}

		// Cache
		return await this.set(content.id, JSON.stringify(content))
	}

	/*
	 * Get fresh model data from source
	 */
	public async getSource(id: string): Promise<Content | undefined> {
		// Init repo
		const repository = new ContentRepository()

		// Find
		return await repository.findOneById(id)
	}
}
