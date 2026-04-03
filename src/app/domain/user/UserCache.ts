import { DefaultCache } from '~/lib/util'
import { User, UserRepository } from './'

export class UserCache extends DefaultCache
{
	/*
	 * Cache storage key prefix
	 */
	protected prefix = 'user'

	/*
	 * Valkey database number
	 */
	protected db = 1

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
	public async fetch(id: number, shouldCache = true): Promise<User | undefined>
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
	public async saveById(id: number): Promise<boolean>
	{
		// Fresh data
		const user = await this.getSource(id)

		// Not found?
		if( ! user) { return false }

		// Cache
		return await this.set(user.id, JSON.stringify(user))
	}

	/*
	 * Save given model in cache
	 */
	public async save(data: User, refresh = false): Promise<boolean>
	{
		// Init
		let user: User = data

		// Refresh?
		if(refresh)
		{
			const source = await this.getSource(data.id)

			if( ! source) { return false }

			user = source
		}

		// Cache
		return await this.set(user.id, JSON.stringify(user))
	}

	/*
	 * Get fresh model data from source
	 */
	public async getSource(id: number): Promise<User | undefined>
	{
		// Init repo
		const repository = new UserRepository()

		// Find
		return await repository.findOneById(id)
	}
}
