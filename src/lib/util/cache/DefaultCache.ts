import type Redis from 'ioredis'
import { log } from '~/lib/util/log'
import { cacheClient } from './cache-client'
import type { CacheOptions } from './types'

/*
 * Default Cache
 *
 * Base class for domain caches (ContentCache, UserCache, etc.).
 * Provides key prefixing, TTL, DB selection, and JSON serialization.
 * Subclasses override prefix, db, and ttl as needed.
 */
export class DefaultCache
{
	/*
	 * Cache key prefix
	 */
	protected prefix = ''

	/*
	 * Valkey database number
	 */
	protected db = 0

	/*
	 * Time to live (seconds). 0 = no expiry.
	 */
	protected ttl = 0

	/*
	 * Constructor
	 */
	constructor(options: CacheOptions = {})
	{
		if(options.prefix) { this.prefix = options.prefix }
		if(options.db !== undefined) { this.db = options.db }
		if(options.ttl !== undefined) { this.ttl = options.ttl }
	}

	/*
	 * Retrieve the ioredis client
	 */
	protected client(): Redis
	{
		return cacheClient.instance()
	}

	/*
	 * Set an item in cache
	 */
	public async set(id: string | number, data: unknown): Promise<boolean>
	{
		// Init value
		let value: string

		// Serialize
		if(typeof data === 'string')
		{
			value = data
		}
		else
		{
			try
			{
				value = JSON.stringify(data)
			}
			catch(error)
			{
				log.error({ error }, 'DefaultCache unable to JSON.stringify')
				return false
			}
		}

		// Build key
		const key = this.parseKey(id)

		// Select database
		await this.client().select(this.db)

		// Set with optional TTL
		if(this.ttl > 0)
		{
			const result = await this.client().set(key, value, 'EX', this.ttl)
			return result === 'OK'
		}

		const result = await this.client().set(key, value)
		return result === 'OK'
	}

	/*
	 * Retrieve a raw string value from cache
	 */
	public async getRaw(id: string | number): Promise<string | null>
	{
		// Select database
		await this.client().select(this.db)

		// Get value
		return await this.client().get(this.parseKey(id))
	}

	/*
	 * Retrieve a parsed value from cache
	 */
	public async get<T>(id: string | number): Promise<T | null>
	{
		// Get raw
		const value = await this.getRaw(id)

		// Not found?
		if(value === null) { return null }

		// Parse JSON
		try
		{
			return JSON.parse(value) as T
		}
		catch
		{
			return null
		}
	}

	/*
	 * Remove an item from cache
	 */
	public async remove(id: string | number): Promise<boolean>
	{
		// Select database
		await this.client().select(this.db)

		// Delete
		const count = await this.client().del(this.parseKey(id))

		return count > 0
	}

	/*
	 * Retrieve all keys matching this cache's prefix
	 */
	public async keys(): Promise<string[]>
	{
		// Select database
		await this.client().select(this.db)

		// Scan for keys
		return await this.client().keys(`${this.parseKey('')}*`)
	}

	/*
	 * Flush all keys for this cache's prefix
	 */
	public async flush(pattern?: string): Promise<boolean>
	{
		// Select database
		await this.client().select(this.db)

		// Determine keys to remove
		const keys = pattern
			? await this.client().keys(pattern)
			: await this.keys()

		// Nothing to remove?
		if(keys.length < 1) { return true }

		// Remove all
		const count = await this.client().del(...keys)

		return count > 0
	}

	/*
	 * Build a prefixed cache key
	 */
	public parseKey(id: string | number): string
	{
		const idStr = id.toString()

		if(this.prefix)
		{
			return `${this.prefix}:${idStr}`
		}

		return idStr
	}
}
