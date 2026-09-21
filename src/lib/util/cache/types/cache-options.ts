/*
 * Cache connection options
 */
export interface CacheConnectionOptions
{
	host?: string
	port?: number
	db?: number
	password?: string
}

/*
 * Options for DefaultCache subclasses
 */
export interface CacheOptions
{
	prefix?: string
	db?: number
	ttl?: number
}
