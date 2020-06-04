import { promisify } from 'es6-promisify'
import { ClientOpts, RedisClient } from 'redis'

export class Client {
	/*
	 * Internal Client
	 */
	private _client: RedisClient

	/*
	 * Constructor
	 */
	constructor(option: ClientOptions = {}) {
		// Override default options
		const options: ClientOpts = {
			host: '127.0.0.1',
			port: 6379,
			db: 0,
			return_buffers: false,
			detect_buffers: false,
			socket_keepalive: true,
			socket_initial_delay: 0,
			no_ready_check: false,
			enable_offline_queue: true,
			retry_unfulfilled_commands: false,
			rename_commands: null,
			tls: null,
			family: 'IPv4',
			path: undefined,
			url: undefined,
			string_numbers: undefined,
			password: undefined,
			prefix: undefined,
			...option
		}

		// Set client
		this._client = new RedisClient(options)

		// Debug Mode?
		if (process.env.DEBUG_MODE === 'true') {
			// Add logging to client events
			this._client.on('error', function(msg) {
				console.error(`Redis ${msg}`)
			})

			this._client.on('ready', function() {
				console.info('Redis Ready')
			})

			this._client.on('connect', function() {
				console.info(`Redis Connected`)
			})

			this._client.on('reconnecting', function() {
				console.info('Redis Reconnecting')
			})

			this._client.on('end', function() {
				console.info(`Redis Ended`)
			})

			this._client.on('warning', function(msg) {
				console.warn(`Redis Warning: ${msg}`)
			})
		}
	}

	/*
	 * Set a cache value
	 */
	public async set(
		key: string,
		value: string,
		mode?: string,
		duration?: number
	): Promise<string | undefined> {
		if (mode && duration) {
			const setAsync = promisify(this._client.set).bind(this._client) as (
				key: string,
				value: string,
				mode: string,
				duration: number
			) => Promise<string | undefined>

			return await setAsync(key, value, mode, duration)
		} else {
			const setAsync = promisify(this._client.set).bind(this._client) as (
				key: string,
				value: string
			) => Promise<string | undefined>

			return await setAsync(key, value)
		}
	}

	/*
	 * Get a cache value
	 */
	public async get(key: string): Promise<string | null> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const getAsync = promisify(this._client.get).bind(this._client) as (
			key: string
		) => Promise<string | null>

		return await getAsync(key)
	}

	/*
	 * Get all cached keys
	 */
	public async keys(pattern: string): Promise<string[]> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const keysAsync = promisify(this._client.keys).bind(this._client) as (
			pattern: string
		) => Promise<string[]>

		return await keysAsync(pattern)
	}

	/*
	 * Delete/remove a cache key-value-pair
	 */
	public async remove(key: string): Promise<boolean> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const delAsync = promisify(this._client.del).bind(this._client) as (
			key: string
		) => Promise<number>

		return (await delAsync(key)) === 1
	}

	/*
	 * Set many values in  cache
	 * example: ['key1', 'value1', 'key2', 'value2', 'etcKey', 'etcValue']
	 */
	public async setMany(keyValuePairs: string[]): Promise<unknown> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const msetAsync = promisify(this._client.mset).bind(this._client) as (
			keyValuePairs: string[]
		) => Promise<unknown>

		return await msetAsync(keyValuePairs)
	}

	/*
	 * Get many values from cache
	 */
	public async getMany(keys: string[]): Promise<string[]> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const mgetAsync = promisify(this._client.mget).bind(this._client) as (
			keys: string[]
		) => Promise<string[]>

		return await mgetAsync(keys)
	}

	/*
	 * Flush ALL key-value-pairs in ALL buckets
	 */
	public async flushAll(): Promise<boolean> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const flushallAsync = promisify(this._client.flushall).bind(
			this._client
		) as () => Promise<boolean>

		return await flushallAsync()
	}

	/*
	 * Select cache database/bucket
	 */
	public async selectBucket(bucket: number | string): Promise<unknown> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const selectAsync = promisify(this._client.select).bind(this._client) as (
			bucket: number | string
		) => Promise<unknown>

		return await selectAsync(bucket)
	}

	/*
	 * Flush / clear all key-value-pairs in active bucket
	 */
	public async dumpBucket(): Promise<boolean> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const flushdbAsync = promisify(this._client.flushdb).bind(
			this._client
		) as () => Promise<boolean>

		return await flushdbAsync()
	}

	/*
	 * Duplicate Client w/new Connection
	 */
	public async duplicate(arg1: ClientOpts | undefined): Promise<RedisClient> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const duplicateAsync = promisify(this._client.duplicate).bind(
			this._client
		) as (arg1: ClientOpts | undefined) => Promise<RedisClient>

		return await duplicateAsync(arg1)
	}

	/*
	 * Disconnect Client
	 */
	public async disconnect(): Promise<boolean> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const quitAsync = promisify(this._client.quit).bind(
			this._client
		) as () => Promise<unknown>

		// Return truthy, OK is expected success value
		return (await quitAsync()) === 'OK'
	}

	/*
	 * Is client currently connected?
	 */
	public connected = async (): Promise<boolean> => {
		// Init
		let isConnected = false

		try {
			// Attempt to add & add value
			await this.set('isConnected', 'true')
			await this.remove('isConnected')

			// No error?
			isConnected = true
		} catch (error) {
			isConnected = false
		}

		return isConnected
	}
}

export interface ClientOptions {
	host?: string // IP address of the Redis server
	port?: number // Port of the Redis server
	db?: number // If set, client will run Redis select command on connect.
	return_buffers?: boolean // If set to true, then all replies will be sent to callbacks as Buffers instead of Strings.
	detect_buffers?: boolean // If set to true, then replies will be sent to callbacks as Buffers. This option lets you switch between Buffers and Strings on a per-command basis, whereas return_buffers applies to every command on a client. Note: This doesn't work properly with the pubsub mode. A subscriber has to either always return Strings or Buffers.
	socket_keepalive?: boolean // If set to true, the keep-alive functionality is enabled on the underlying socket.
	socket_initial_delay?: number // Initial Delay in milliseconds, and this will also behave the interval keep alive message sending to Redis.
	no_ready_check?: boolean // When a connection is established to the Redis server, the server might still be loading the database from disk. While loading, the server will not respond to any commands. To work around this, Node Redis has a "ready check" which sends the INFO command to the server. The response from the INFO command indicates whether the server is ready for more commands. When ready, node_redis emits a ready event. Setting no_ready_check to true will inhibit this check.
	enable_offline_queue?: boolean // By default, if there is no active connection to the Redis server, commands are added to a queue and are executed once the connection has been established. Setting enable_offline_queue to false will disable this feature and the callback will be executed immediately with an error, or an error will be emitted if no callback is specified.
	retry_unfulfilled_commands?: boolean // If set to true, all commands that were unfulfilled while the connection is lost will be retried after the connection has been reestablished. Use this with caution if you use state altering commands (e.g. incr). This is especially useful if you use blocking commands.
	rename_commands?: {} | null // Passing an object with renamed commands to use instead of the original functions. For example, if you renamed the command KEYS to "DO-NOT-USE" then the rename_commands object would be: { KEYS : "DO-NOT-USE" } . See the Redis security topics for more info.
	tls?: {} | null // An object containing options to pass to tls.connect to set up a TLS connection to Redis (if, for example, it is set up to be accessible via a tunnel).
	family?: string // You can force using IPv6 if you set the family to 'IPv6'. See Node.js net or dns modules on how to use the family type.
	path?: string | undefined // The UNIX socket string of the Redis server
	url?: string | undefined // The URL of the Redis server. Format: [redis[s]:]//[[user][:password@]][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]] (More info avaliable at IANA).
	string_numbers?: boolean | undefined //Set to true, Node Redis will return Redis number values as Strings instead of javascript Numbers. Useful if you need to handle big numbers (above Number.MAX_SAFE_INTEGER === 2^53). Hiredis is incapable of this behavior, so setting this option to true will result in the built-in javascript parser being used no matter the value of the parser option.
	password?: string | undefined // If set, client will run Redis auth command on connect. Alias auth_pass Note Node Redis < 2.5 must use auth_pass
	prefix?: string | undefined // A string used to prefix all used keys (e.g. namespace:test). Please be aware that the keys command will not be prefixed. The keys command has a "pattern" as argument and no key and it would be impossible to determine the existing keys in Redis if this would be prefixed.
	// disable_resubscribing = false // If set to true, a client won't resubscribe after disconnecting.
}
