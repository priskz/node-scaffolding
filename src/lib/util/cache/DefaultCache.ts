import { Client } from './'

export class DefaultCache {
	/*
	 * The _client storage bucket this should act upon
	 */
	protected bucket = 0

	/*
	 * Cache storage key prefix
	 */
	protected prefix = ''

	/*
	 * Time To Live (seconds) Infinite = 0
	 */
	protected ttl = 0

	/*
	 * Cache client
	 */
	private _client: Client

	/*
	 * Constructor
	 * @arg options._client: If not provided, use global _client if exists, otherwise use default _client
	 */
	constructor(options: CacheOptions = {}) {
		// Set _client
		if (options.client) {
			this._client = options.client
		} else {
			// Default
			this._client = new Client()
		}

		// Set options
		if (options.bucket) this.bucket = options.bucket
		if (options.prefix) this.prefix = options.prefix
		if (options.ttl) this.ttl = options.ttl
	}

	/*
	 * Retrieve Client
	 */
	public client(): Client {
		return this._client
	}

	/*
	 * Set an item in cache
	 */
	public async set(id: string | number, data: unknown): Promise<boolean> {
		// Init _client value
		let value = typeof data === 'string' ? data : ''

		// Set the bucket
		await this._client.selectBucket(this.bucket)

		// Data not a string? Attempt to convert to json string
		if (typeof data !== 'string') {
			try {
				value = JSON.stringify(data)
			} catch (error) {
				if (this.client().getDebug()) {
					// Log
					this.client().logger.error(
						`DefaultCache unable to JSON.stringify: ${value}:${error}`
					)
				}

				return false
			}
		}

		if (this.ttl > 0) {
			// Set the value w/expiration
			return await this._client.set(this.parseKey(id), value, 'EX', this.ttl)
		}

		// Set the value
		return await this._client.set(this.parseKey(id), value)
	}

	/*
	 * Retrieve an raw item value from cache
	 */
	public async getRaw(id: string | number): Promise<string | null> {
		// Set the bucket
		await this._client.selectBucket(this.bucket)

		// Retrieve value
		return await this._client.get(this.parseKey(id))
	}

	/*
	 * Retrieve an item from cache
	 */
	public async get<T>(id: string | number): Promise<T | null> {
		// Retrieve raw value
		const value = await this.getRaw(id)

		// Return undefined if null
		if (!value) return null

		// JSON?
		try {
			// Return object if parsable
			return JSON.parse(value)
		} catch (e) {
			// Return raw value
			return null
		}
	}

	/*
	 * Remove / delete an item from cache
	 */
	public async remove(id: string | number): Promise<boolean> {
		// Set the bucket
		await this._client.selectBucket(this.bucket)

		// Retrieve value
		return await this._client.remove(this.parseKey(id))
	}

	/*
	 * Retrieve keys in configured bucket matching prefix
	 */
	public async keys(): Promise<string[]> {
		// Set the bucket
		await this._client.selectBucket(this.bucket)

		// Retrieve value
		return await this._client.keys(`${this.parseKey('')}*`)
	}

	/*
	 * Flush all keys for configured bucket & prefix by default unless given pattern
	 */
	public async flush(pattern?: string): Promise<boolean> {
		// Set the bucket
		await this._client.selectBucket(this.bucket)

		// Init
		let keys: string[] = []

		// Pattern given?
		if (pattern) {
			// Get keys by pattern
			keys = await this._client.keys(pattern)
		} else {
			// Get keys by class configuration
			keys = await this.keys()
		}

		// Nothing to remove
		if (keys.length < 1) return true

		// Remove all at once
		return await this._client.remove(keys)
	}

	/*
	 * Set bucket property
	 */
	public setBucket(bucket: number): void {
		this.bucket = bucket
	}

	/*
	 * Set prefix property
	 */
	public setPrefix(prefix: string): void {
		this.prefix = prefix
	}

	/*
	 * Set ttl property
	 */
	public setTtl(ttl: number): void {
		this.ttl = ttl
	}

	/*
	 * Get bucket property
	 */
	public getBucket(): number {
		return this.bucket
	}

	/*
	 * Get prefix property
	 */
	public getPrefix(): string {
		return this.prefix
	}

	/*
	 * Get ttl property
	 */
	public getTtl(): number {
		return this.ttl
	}

	/*
	 * Convert id to string and concat configured prefix
	 */
	public parseKey(id: string | number): string {
		let key = id.toString()

		if (this.prefix) {
			key = `${this.prefix}:${id.toString()}`
		}

		return key
	}
}

interface CacheOptions {
	client?: Client
	bucket?: number
	prefix?: string
	ttl?: number
}
