import pino, { type Logger as PinoLogger, type TransportTargetOptions } from 'pino'
import { env } from '~/lib/util/env'
import { consoleTransportOptions } from './transports/console'
import { fileTransportOptions } from './transports/file'
import { requestContext } from './request-context'
import type { LogLevel } from './types/log-level'

/*
 * LogService
 *
 * Singleton Pino root logger with destination-based transport wiring.
 * Child loggers carry module context automatically.
 *
 * Architecture:
 * - Root logger created once at startup
 * - Child loggers per module via createLogger()
 * - requestId injected via mixin from AsyncLocalStorage
 * - Destinations parsed from LOG_DESTINATIONS env var
 * - pino-pretty for dev, raw JSON for prod
 */

let rootLogger: PinoLogger

/*
 * Initialize the root logger
 *
 * Called once during app bootstrap. Parses LOG_DESTINATIONS
 * and wires the appropriate transports.
 */
function init(): PinoLogger
{
	// Parse destinations from env
	const destinations = env.LOG_DESTINATIONS.split(',').map(d => d.trim())

	// Build transport targets
	const targets: TransportTargetOptions[] = []

	for(const dest of destinations)
	{
		if(dest === 'console')
		{
			const opts = consoleTransportOptions()

			if(opts)
			{
				// pino-pretty for dev
				targets.push(opts as TransportTargetOptions)
			}
			else
			{
				// Raw JSON to stdout for prod
				targets.push({
					target: 'pino/file',
					options: { destination: 1 },
				})
			}
		}

		if(dest === 'file')
		{
			const opts = fileTransportOptions()

			if(opts)
			{
				targets.push(opts as TransportTargetOptions)
			}
		}
	}

	// Build pino options
	const options: pino.LoggerOptions = {
		level: env.LOG_LEVEL as LogLevel,

		// Inject requestId from AsyncLocalStorage into every log entry
		mixin()
		{
			const requestId = requestContext.getRequestId()
			return requestId ? { requestId } : {}
		},
	}

	// Create logger with transports or default stdout
	if(targets.length > 0)
	{
		rootLogger = pino(options, pino.transport({ targets }))
	}
	else
	{
		rootLogger = pino(options)
	}

	return rootLogger
}

/*
 * Get the root logger
 *
 * Returns the initialized root logger instance.
 * Throws if called before init().
 */
function root(): PinoLogger
{
	if( ! rootLogger)
	{
		throw new Error('LogService not initialized — call init() first')
	}

	return rootLogger
}

/*
 * Create a child logger for a specific module
 *
 * Child loggers inherit root configuration and automatically
 * tag every entry with their source module name.
 */
function createLogger(module: string): PinoLogger
{
	return root().child({ module })
}

export const logService = { init, root, createLogger }
