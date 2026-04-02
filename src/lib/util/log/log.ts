import type { Logger as PinoLogger } from 'pino'
import { logService } from './log-service'

/*
 * Global Log Facade
 *
 * Convenience wrapper over the Pino root logger.
 * Provides a simple API for application-level logging.
 *
 * For module-specific logging, use logService.createLogger('ModuleName')
 * which returns a child logger tagged with the module name.
 *
 * Structured logging convention:
 *   log.info({ leagueId, userId }, 'auction started')
 *   NOT: log.info('auction started for league ' + leagueId)
 */

/*
 * Initialize logging
 *
 * Called once during app bootstrap. Must be called before
 * any log methods are used.
 */
function init(): PinoLogger
{
	return logService.init()
}

/*
 * Get the root logger instance
 */
function logger(): PinoLogger
{
	return logService.root()
}

/*
 * Export log facade
 *
 * Each method delegates to the root Pino logger.
 * Supports both (msg) and (obj, msg) calling conventions.
 */
export const log = {
	init,
	logger,

	// Log levels — structured: log.info({ key: value }, 'message')
	trace: (objOrMsg: object | string, msg?: string) => _log('trace', objOrMsg, msg),
	debug: (objOrMsg: object | string, msg?: string) => _log('debug', objOrMsg, msg),
	info: (objOrMsg: object | string, msg?: string) => _log('info', objOrMsg, msg),
	warn: (objOrMsg: object | string, msg?: string) => _log('warn', objOrMsg, msg),
	error: (objOrMsg: object | string, msg?: string) => _log('error', objOrMsg, msg),
	fatal: (objOrMsg: object | string, msg?: string) => _log('fatal', objOrMsg, msg),

	// Child logger factory
	child: (module: string) => logService.createLogger(module),
}

/*
 * Internal dispatch
 *
 * Handles both calling conventions:
 *   log.info('simple message')
 *   log.info({ data }, 'structured message')
 */
function _log(level: string, objOrMsg: object | string, msg?: string): void
{
	const root = logService.root()

	if(typeof objOrMsg === 'string')
	{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(root as any)[level](objOrMsg)
	}
	else
	{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(root as any)[level](objOrMsg, msg)
	}
}
