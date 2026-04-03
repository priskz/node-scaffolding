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

	// Logging
	LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
	LOG_DESTINATIONS: z.string().default('console'),
	LOG_CONSOLE_PRETTY: z.string().default('true'),
	LOG_FILE_PATH: z.string().optional(),

	// Cache
	CACHE_HOST: z.string().default('localhost'),
	CACHE_PORT: z.coerce.number().default(6379),
	CACHE_DB: z.coerce.number().default(0),
	CACHE_PASSWORD: z.string().optional(),

	// Mail
	MAIL_HOST: z.string().default('localhost'),
	MAIL_PORT: z.coerce.number().default(1025),
	MAIL_USERNAME: z.string().optional(),
	MAIL_PASSWORD: z.string().optional(),
	MAIL_FROM_NAME: z.string().default('Rhizome'),
	MAIL_FROM_ADDRESS: z.string().default('noreply@rhizome.dev'),
	MAIL_SECURE: z.string().default('false'),

	// Storage
	STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
	STORAGE_LOCAL_ROOT: z.string().default('./storage'),
	STORAGE_S3_BUCKET: z.string().optional(),
	STORAGE_S3_REGION: z.string().optional(),
	STORAGE_S3_ACCESS_KEY: z.string().optional(),
	STORAGE_S3_SECRET_KEY: z.string().optional(),
	STORAGE_S3_ENDPOINT: z.string().optional(),

	// Socket
	SOCKET_ENABLED: z.string().default('false'),
	SOCKET_PATH: z.string().default('/socket.io'),
	SOCKET_CORS_ORIGIN: z.string().default('*'),

	// Events
	EVENT_STREAM_ENABLED: z.string().default('false'),
	EVENT_STREAM_KEY: z.string().default('rhizome:events'),

	// Tenancy
	TENANCY_ENABLED: z.string().default('false'),
	TENANCY_STRATEGY: z.enum(['row', 'schema']).default('row'),
	TENANCY_RESOLVER: z.enum(['header', 'subdomain', 'path']).default('header'),
	TENANCY_HEADER: z.string().default('X-Tenant-ID'),

	// Webhooks
	WEBHOOK_QUEUE_ENABLED: z.string().default('false'),
	WEBHOOK_MAX_RETRIES: z.coerce.number().default(5),
	WEBHOOK_RETRY_DELAY: z.coerce.number().default(5000),

	// OAuth
	OAUTH_GOOGLE_ENABLED: z.string().default('false'),
	OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
	OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
	OAUTH_GOOGLE_CALLBACK_URL: z.string().default('/auth/google/callback'),
	OAUTH_GITHUB_ENABLED: z.string().default('false'),
	OAUTH_GITHUB_CLIENT_ID: z.string().optional(),
	OAUTH_GITHUB_CLIENT_SECRET: z.string().optional(),
	OAUTH_GITHUB_CALLBACK_URL: z.string().default('/auth/github/callback'),

	// TOTP / 2FA
	TOTP_ENABLED: z.string().default('false'),
	TOTP_ISSUER: z.string().default('Rhizome'),
	RECOVERY_CODE_COUNT: z.coerce.number().default(10),

	// Jobs (BullMQ)
	JOB_ENABLED: z.string().default('false'),
	JOB_BOARD_ENABLED: z.string().default('false'),
	JOB_BOARD_PATH: z.string().default('/admin/queues'),
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
