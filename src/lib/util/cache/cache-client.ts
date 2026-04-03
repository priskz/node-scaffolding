import Redis from 'ioredis'
import { log } from '~/lib/util/log'
import type { CacheConnectionOptions } from './types'

/*
 * Cache Client
 *
 * Thin wrapper around ioredis. Exposes the common operations
 * needed by DefaultCache and domain caches.
 * Debug event logging via Pino child logger.
 */

// Lazy child logger — created on first use, after LogService.init()
let _cacheLog: ReturnType<typeof log.child> | undefined

function cacheLog(): ReturnType<typeof log.child>
{
	if( ! _cacheLog)
	{
		_cacheLog = log.child('CacheClient')
	}

	return _cacheLog
}

let client: Redis | undefined

/*
 * Connect to Valkey/Redis
 */
function connect(options: CacheConnectionOptions = {}): Redis
{
	// Already connected?
	if(client)
	{
		return client
	}

	// Init client
	client = new Redis({
		host: options.host ?? 'localhost',
		port: options.port ?? 6379,
		db: options.db ?? 0,
		password: options.password,
		lazyConnect: true,
		maxRetriesPerRequest: 3,
	})

	// Wire up event logging
	client.on('error', (err) => cacheLog().error({ err }, 'cache error'))
	client.on('connect', () => cacheLog().debug('cache connected'))
	client.on('ready', () => cacheLog().debug('cache ready'))
	client.on('close', () => cacheLog().debug('cache closed'))
	client.on('reconnecting', () => cacheLog().debug('cache reconnecting'))

	return client
}

/*
 * Retrieve the active client
 */
function instance(): Redis
{
	if( ! client)
	{
		throw new Error('Cache client not initialized — call cache.connect() first')
	}

	return client
}

/*
 * Disconnect from Valkey/Redis
 */
async function disconnect(): Promise<void>
{
	if(client)
	{
		await client.quit()
		client = undefined
	}
}

/*
 * Check if client is connected
 */
async function connected(): Promise<boolean>
{
	if( ! client)
	{
		return false
	}

	try
	{
		const pong = await client.ping()
		return pong === 'PONG'
	}
	catch
	{
		return false
	}
}

export const cacheClient = {
	connect,
	instance,
	disconnect,
	connected,
}
