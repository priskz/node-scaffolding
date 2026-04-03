import type { ServerOptions } from 'socket.io'

/*
 * Socket Init Options
 *
 * Subset of socket.io ServerOptions relevant to our wrapper.
 */
export interface SocketInitOptions
{
	path?: string
	cors?: ServerOptions['cors']
}

/*
 * Socket Emit Options
 *
 * Target a specific room or broadcast to all connected clients.
 */
export interface SocketEmitOptions
{
	room?: string
}
