import { DefaultCache } from '~/lib/util'
import { Content, ContentRepository } from './'

export class ContentCache extends DefaultCache
{
	/*
	 * Cache storage key prefix
	 */
	protected prefix = 'content'

	/*
	 * Valkey database number
	 */
	protected db = 3

	/*
	 * Constructor
	 */
	constructor()
	{
		super()
	}

	/*
	 * Fetch model from cache. Optionally, cache a fresh copy if it doesn't exist
	 */
	public async fetch(id: string, shouldCache = true): Promise<Content | undefined>
	{
		// Find in cache
		const data = await this.getRaw(id)

		// Found?
		if(data)
		{
			return JSON.parse(data)
		}

		// Cache it now?
		if( ! shouldCache) { return undefined }

		// Find fresh source
		const source = await this.getSource(id)

		// Not found?
		if( ! source) { return undefined }

		// Add to cache
		await this.save(source)

		return JSON.parse(JSON.stringify(source))
	}

	/*
	 * Save model in cache by given id
	 */
	public async saveById(id: string): Promise<boolean>
	{
		// Fresh data
		const content = await this.getSource(id)

		// Not found?
		if( ! content) { return false }

		// Cache
		return await this.set(content.id, JSON.stringify(content))
	}

	/*
	 * Save given Content in cache
	 */
	public async save(data: Content, refresh = false): Promise<boolean>
	{
		// Init
		let content: Content = data

		// Refresh?
		if(refresh)
		{
			const source = await this.getSource(data.id.toString())

			if( ! source) { return false }

			content = source
		}

		// Cache
		return await this.set(content.id, JSON.stringify(content))
	}

	/*
	 * Get fresh model data from source
	 */
	public async getSource(id: string): Promise<Content | undefined>
	{
		// Init repo
		const repository = new ContentRepository()

		// Find
		return await repository.findOneById(id)
	}
}
