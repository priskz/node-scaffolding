import { promisify } from 'es6-promisify'
import { ClientOpts, RedisClient } from 'redis'
import { Logger } from '~/lib/util'

/*
 * Default Client Options
 */
const defaultOptions: ClientOpts = {
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
	prefix: undefined
}

export class Client {
	/*
	 * Internal Client
	 */
	private _client: RedisClient

	/*
	 * Throw Exceptions
	 */
	private _throws = false

	/*
	 * Debug Mode
	 */
	protected debug = false

	/*
	 * Internal Logger
	 */
	public logger: Console | Logger = console

	/*
	 * Constructor
	 */
	constructor(option: ClientOptions = {}, client?: RedisClient) {
		// Set debug based on ENV var
		this.debug = process.env.DEBUG_MODE === 'true'

		// Client provided?
		if (client) {
			// Use client if given.
			this._client = client
		} else {
			// Override default options
			const options: ClientOpts = {
				...defaultOptions,
				...option
			}

			// Set client
			this._client = new RedisClient(options)
		}

		// Debug Mode?
		if (this.debug) {
			// Logger instance
			const logger = this.logger

			// Add logging to client events
			this._client.on('error', function(msg) {
				logger.error(`Redis ${msg}`)
			})

			this._client.on('ready', function() {
				logger.info('Redis Ready')
			})

			this._client.on('connect', function() {
				logger.info(`Redis Connected`)
			})

			this._client.on('reconnecting', function() {
				logger.info('Redis Reconnecting')
			})

			this._client.on('end', function() {
				logger.info(`Redis Ended`)
			})

			this._client.on('warning', function(msg) {
				logger.warn(`Redis Warning: ${msg}`)
			})
		}
	}

	/*
	 * Set throw property
	 */
	public setThrows(value: boolean): void {
		this._throws = value
	}

	/*
	 * Get throw property
	 */
	public getThrows(): boolean {
		return this._throws
	}

	/*
	 * Set debug property
	 */
	public setDebug(value: boolean): void {
		this.debug = value
	}

	/*
	 * Get debug property
	 */
	public getDebug(): boolean {
		return this.debug
	}

	/*
	 * Set a cache value
	 */
	public async set(
		key: string,
		value: string,
		mode?: string,
		duration?: number
	): Promise<boolean> {
		// Init
		let setAsync
		let result

		// Optional params set?
		if (mode && duration) {
			setAsync = promisify(this._client.set).bind(this._client) as (
				key: string,
				value: string,
				mode: string,
				duration: number
			) => Promise<string | undefined>

			// Execute function
			result = await setAsync(key, value, mode, duration).catch(e => {
				// Log
				if (this.debug) {
					this.logger.error(e.message)
				}

				// Bail on fail?
				if (this._throws) throw e
			})
		} else {
			setAsync = promisify(this._client.set).bind(this._client) as (
				key: string,
				value: string
			) => Promise<string | undefined>

			// Execute function
			result = await setAsync(key, value).catch(e => {
				// Log
				if (this.debug) {
					this.logger.error(e.message)
				}

				// Bail on fail?
				if (this._throws) throw e
			})
		}

		// Return
		return result === 'OK'
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

		// Execute function
		const result = await getAsync(key).catch(e => {
			// Log
			if (this.debug) {
				this.logger.error(e.message)
			}

			// Bail on fail?
			if (this._throws) throw e

			// Return null
			return null
		})

		// Return bool
		return result
	}

	/*
	 * Get cached keys by given param
	 * Note '*' is a wildcard and will return all bucket keys if by itself
	 */
	public async keys(pattern: string): Promise<string[]> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const keysAsync = promisify(this._client.keys).bind(this._client) as (
			pattern: string
		) => Promise<string[]>

		// Execute function
		const result = await keysAsync(pattern).catch(e => {
			// Log
			if (this.debug) {
				this.logger.error(e.message)
			}

			// Bail on fail?
			if (this._throws) throw e

			// Empty
			return []
		})

		// Return
		return result
	}

	/*
	 * Delete/remove cache key-value-pair(s)
	 */
	public async remove(key: string | string[]): Promise<boolean> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const delAsync = promisify(this._client.del).bind(this._client) as (
			key: string | string[]
		) => Promise<number>

		// Execute function
		const result = await delAsync(key).catch(e => {
			// Log
			if (this.debug) {
				this.logger.error(e.message)
			}

			// Bail on fail?
			if (this._throws) throw e

			// Failed
			return false
		})

		// Return true if any removed, partial or all
		return result > 0
	}

	/*
	 * Set many values in  cache
	 * example: ['key1', 'value1', 'key2', 'value2', 'etcKey', 'etcValue']
	 */
	public async setMany(keyValuePairs: string[]): Promise<boolean> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const msetAsync = promisify(this._client.mset).bind(this._client) as (
			keyValuePairs: string[]
		) => Promise<boolean>

		// Execute function
		const result = await msetAsync(keyValuePairs).catch(e => {
			// Log
			if (this.debug) {
				this.logger.error(e.message)
			}

			// Bail on fail?
			if (this._throws) throw e

			// Failed
			return false
		})

		// Return
		return result
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

		// Execute function
		const result = await mgetAsync(keys).catch(e => {
			// Log
			if (this.debug) {
				this.logger.error(e.message)
			}

			// Bail on fail?
			if (this._throws) throw e

			// Empty
			return []
		})

		// Return
		return result
	}

	/*
	 * Flush ALL key-value-pairs in ALL buckets
	 */
	public async flushAll(): Promise<boolean> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const flushallAsync = promisify(this._client.flushall).bind(
			this._client
		) as () => Promise<string>

		// Execute function
		const result = await flushallAsync().catch(e => {
			// Log
			if (this.debug) {
				this.logger.error(e.message)
			}

			// Bail on fail?
			if (this._throws) throw e
		})

		// Return bool
		return result === 'OK'
	}

	/*
	 * Select cache database/bucket
	 */
	public async selectBucket(bucket: number | string): Promise<boolean> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const selectAsync = promisify(this._client.select).bind(this._client) as (
			bucket: number | string
		) => Promise<string>

		// Execute function
		const result = await selectAsync(bucket).catch(e => {
			// Log
			if (this.debug) {
				this.logger.error(e.message)
			}

			// Bail on fail?
			if (this._throws) throw e
		})

		// Return bool
		return result === 'OK'
	}

	/*
	 * Flush / clear all key-value-pairs in active bucket
	 */
	public async dumpBucket(): Promise<boolean> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const flushdbAsync = promisify(this._client.flushdb).bind(
			this._client
		) as () => Promise<string>

		// Execute function
		const result = await flushdbAsync().catch(e => {
			// Log
			if (this.debug) {
				this.logger.error(e.message)
			}

			// Bail on fail?
			if (this._throws) throw e
		})

		// Return bool
		return result === 'OK'
	}

	/*
	 * Duplicate Client w/new Connection
	 */
	public async duplicate(options?: ClientOpts): Promise<Client> {
		// Override config values
		const config: ClientOpts = {
			...options
		}

		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const duplicateAsync = promisify(this._client.duplicate).bind(
			this._client
		) as (config: ClientOpts | undefined) => Promise<RedisClient>

		// Execute function
		const client = await duplicateAsync(config).catch(e => {
			// Log
			if (this.debug) {
				this.logger.error(e.message)
			}

			// Rethrow, bigger issue here.
			throw e
		})

		// Return Client
		return new Client({}, client)
	}

	/*
	 * Disconnect Client
	 */
	public async disconnect(): Promise<boolean> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const quitAsync = promisify(this._client.quit).bind(
			this._client
		) as () => Promise<string>

		// Execute function
		const result = await quitAsync().catch(e => {
			// Log
			if (this.debug) {
				this.logger.error(e.message)
			}

			// Bail on fail?
			if (this._throws) throw e
		})

		// Return bool
		return result === 'OK'
	}

	/*
	 * Is client currently connected?
	 */
	public async connected(): Promise<boolean> {
		// Note: V4 of node/redis will include async functions
		// Wrap client's method with promise and call immediately
		const pingAsync = promisify(this._client.ping).bind(
			this._client
		) as () => Promise<string>

		// Execute function
		const connected = await pingAsync().catch(e => {
			// Log
			if (this.debug) {
				this.logger.error(e.message)
			}

			// Bail on fail?
			if (this._throws) throw e
		})

		// Return bool
		return connected === 'PONG'
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
