import { z } from 'zod'

/*
 * Environment Variable Schema
 *
 * Validates all required env vars at startup.
 * Fails fast with descriptive errors if anything is missing or invalid.
 * Provides a typed, validated env object — no string keys, no runtime surprises.
 */
const envSchema = z.object({
	// App
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	APP_PORT: z.string().default('80'),
	COOKIE_SECRET: z.string().min(1, 'COOKIE_SECRET is required'),
	DEBUG_MODE: z.string().optional(),

	// Database
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

	// JWT
	JWT_SECRET: z.string().min(1).default('change-me-in-production'),
	JWT_ACCESS_EXPIRY: z.string().default('15m'),
	JWT_REFRESH_EXPIRY: z.string().default('7d'),
	JWT_ISSUER: z.string().default('rhizome'),

	// CORS
	CORS_ORIGIN: z.string().default('*'),

	// Rate Limiting
	RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
	RATE_LIMIT_MAX: z.coerce.number().default(100),

	// Cache
	REDIS_CACHE_DEFAULT: z.string().default('redis'),
	REDIS_CACHE_HOST: z.string().default('localhost'),
	REDIS_CACHE_PORT: z.coerce.number().default(6379),
	REDIS_CACHE_DB_DEFAULT: z.coerce.number().default(0),
})

/*
 * Validate and export
 *
 * Runs at import time — after dotenv has loaded process.env.
 * If validation fails, the app crashes immediately with a clear error.
 */
const parsed = envSchema.safeParse(process.env)

if( ! parsed.success)
{
	const formatted = parsed.error.issues
		.map(issue => `  ${issue.path.join('.')}: ${issue.message}`)
		.join('\n')

	throw new Error(`Environment validation failed:\n${formatted}`)
}

export const env = parsed.data

/*
 * Env type — for use in other config files
 */
export type Env = z.infer<typeof envSchema>
