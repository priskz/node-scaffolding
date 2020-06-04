import { env } from '~/lib/util'

export const cache: CacheConfig = {
	default: env('REDIS_CACHE_DEFAULT'),
	get driver() {
		return this.store[this.default]
	},
	store: {
		redis: {
			host: env('REDIS_CACHE_HOST'),
			port: env('REDIS_CACHE_PORT'),
			db: env('REDIS_CACHE_DB_DEFAULT')
		}
	}
}

export interface CacheConfig {
	default: Driver
	driver: DriverConfig
	store: Stores
}

interface Stores {
	[key: string]: DriverConfig
}

type Driver = 'redis'

type DriverConfig = RedisConfig

interface RedisConfig {
	host: string
	port: number
	db: number
}
