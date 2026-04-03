import { env } from '~/lib/util/env'

/*
 * Socket Configuration
 *
 * Maps env vars to socket.io init options.
 */
export interface SocketConfig
{
	enabled: boolean
	path: string
	corsOrigin: string | string[]
}

export const socket: SocketConfig = {
	enabled: env.SOCKET_ENABLED === 'true',
	path: env.SOCKET_PATH,
	corsOrigin: env.SOCKET_CORS_ORIGIN === '*'
		? '*'
		: env.SOCKET_CORS_ORIGIN.split(',').map(s => s.trim()),
}
