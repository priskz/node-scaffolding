import { cacheClient } from './cache-client'

/*
 * Remember Pattern
 *
 * Check cache → miss → call factory → store → return.
 * Never caches errors — if factory throws, the error propagates
 * and nothing is written to cache.
 */
export async function remember<T>(
	key: string,
	ttl: number,
	factory: () => Promise<T>
): Promise<T>
{
	// Init client
	const client = cacheClient.instance()

	// Check cache
	const cached = await client.get(key)

	// Hit?
	if(cached !== null)
	{
		return JSON.parse(cached) as T
	}

	// Miss — call factory
	const value = await factory()

	// Store result
	if(ttl > 0)
	{
		await client.set(key, JSON.stringify(value), 'EX', ttl)
	}
	else
	{
		await client.set(key, JSON.stringify(value))
	}

	return value
}
