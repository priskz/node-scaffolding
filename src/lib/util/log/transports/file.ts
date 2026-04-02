import { env } from '~/lib/util/env'

/*
 * File Transport Options
 *
 * Returns pino transport config for file destination when LOG_FILE_PATH is set.
 */
export function fileTransportOptions(): object | undefined
{
	if( ! env.LOG_FILE_PATH)
	{
		return undefined
	}

	return {
		target: 'pino/file',
		options: {
			destination: env.LOG_FILE_PATH,
			mkdir: true,
		},
	}
}
