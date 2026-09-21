/*
 * Log Configuration
 *
 * Logging is now configured entirely via environment variables:
 *   LOG_LEVEL        — trace | debug | info | warn | error | fatal
 *   LOG_DESTINATIONS — comma-separated: console, file
 *   LOG_CONSOLE_PRETTY — true for pino-pretty in dev
 *   LOG_FILE_PATH    — file destination path (optional)
 *
 * This file exists for backward compatibility with the config barrel.
 * No runtime config object is needed — LogService reads env directly.
 */

export interface LogConfig
{
	engine: string
}

export const log: LogConfig = {
	engine: 'pino',
}
