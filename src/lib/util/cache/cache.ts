import { cacheClient } from './cache-client'
import type { CacheConnectionOptions } from './types'

/*
 * Cache Facade
 *
 * Global connect/disconnect lifecycle.
 * Delegates to cacheClient for the ioredis instance.
 */

/*
 * Connect to cache
 */
async function connect(options: CacheConnectionOptions = {}): Promise<boolean>
{
	// Init client
	const client = cacheClient.connect(options)

	// Establish connection
	await client.connect()

	// Verify
	return await cacheClient.connected()
}

/*
 * Disconnect from cache
 */
async function disconnect(): Promise<void>
{
	await cacheClient.disconnect()
}

/*
 * Export facade
 */
export const cache = {
	connect,
	disconnect,
	client: cacheClient.instance,
}
