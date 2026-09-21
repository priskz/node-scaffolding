import type { DestinationStream } from 'pino'
import { env } from '~/lib/util/env'

/*
 * Build Console Transport
 *
 * Returns pino-pretty in development, raw stdout in production.
 * pino-pretty is a dev dependency — never loaded in prod builds.
 */
export function buildConsoleTransport(): DestinationStream | undefined
{
	const usePretty = env.LOG_CONSOLE_PRETTY === 'true' && env.NODE_ENV !== 'production'

	if( ! usePretty)
	{
		return undefined
	}

	// Dynamic import workaround — pino-pretty is loaded via pino's transport option
	// Return undefined here; pretty transport is wired in log-service via pino options
	return undefined
}

/*
 * Console Transport Options
 *
 * Returns pino transport config for pino-pretty when applicable.
 */
export function consoleTransportOptions(): object | undefined
{
	const usePretty = env.LOG_CONSOLE_PRETTY === 'true' && env.NODE_ENV !== 'production'

	if( ! usePretty)
	{
		return undefined
	}

	return {
		target: 'pino-pretty',
		options: {
			colorize: true,
			translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
			ignore: 'pid,hostname',
		},
	}
}
