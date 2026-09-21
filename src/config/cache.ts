import { env } from '~/lib/util'
import type { CacheConnectionOptions } from '~/lib/util/cache'

/*
 * Cache Config
 *
 * Connection options for Valkey/Redis via ioredis.
 */
export const cache: CacheConnectionOptions = {
	host: env.CACHE_HOST,
	port: env.CACHE_PORT,
	db: env.CACHE_DB,
	password: env.CACHE_PASSWORD,
}
