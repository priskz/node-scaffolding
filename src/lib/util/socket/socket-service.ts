import { Server as SocketServer } from 'socket.io'
import type { Server as HttpServer } from 'http'
import { log } from '~/lib/util/log'
import type { SocketInitOptions, SocketEmitOptions } from './types'

/*
 * Socket Service
 *
 * Wraps socket.io Server for room-based pub/sub.
 * Init requires the httpServer from server.ts — must be called after Express binds.
 */

let io: SocketServer | undefined

// Lazy child logger — same pattern as CacheClient, MailService
let _socketLog: ReturnType<typeof log.child> | undefined

function socketLog(): ReturnType<typeof log.child>
{
	if( ! _socketLog)
	{
		_socketLog = log.child('SocketService')
	}

	return _socketLog
}

/*
 * Initialize — attach socket.io to the HTTP server
 */
function init(httpServer: HttpServer, options: SocketInitOptions = {}): SocketServer
{
	if(io)
	{
		return io
	}

	io = new SocketServer(httpServer, {
		path: options.path ?? '/socket.io',
		cors: options.cors,
	})

	io.on('connection', (socket) =>
	{
		socketLog().debug({ socketId: socket.id }, 'client connected')

		socket.on('disconnect', (reason) =>
		{
			socketLog().debug({ socketId: socket.id, reason }, 'client disconnected')
		})
	})

	socketLog().info('socket.io initialized')

	return io
}

/*
 * Server instance — throws if not initialized
 */
function server(): SocketServer
{
	if( ! io)
	{
		throw new Error('SocketService not initialized — call socket.init(httpServer) first')
	}

	return io
}

/*
 * Emit an event — optionally scoped to a room
 */
function emit(event: string, data: unknown, options: SocketEmitOptions = {}): void
{
	const s = server()

	if(options.room)
	{
		s.to(options.room).emit(event, data)
		socketLog().debug({ event, room: options.room }, 'emitted to room')
	}
	else
	{
		s.emit(event, data)
		socketLog().debug({ event }, 'emitted to all')
	}
}

/*
 * Join a socket to a room
 */
async function join(socketId: string, room: string): Promise<void>
{
	const s = server()
	const socket = s.sockets.sockets.get(socketId)

	if( ! socket)
	{
		socketLog().warn({ socketId, room }, 'socket not found for join')
		return
	}

	await socket.join(room)
	socketLog().debug({ socketId, room }, 'joined room')
}

/*
 * Remove a socket from a room
 */
async function leave(socketId: string, room: string): Promise<void>
{
	const s = server()
	const socket = s.sockets.sockets.get(socketId)

	if( ! socket)
	{
		socketLog().warn({ socketId, room }, 'socket not found for leave')
		return
	}

	await socket.leave(room)
	socketLog().debug({ socketId, room }, 'left room')
}

/*
 * Get connected socket count — useful for health checks
 */
async function connections(): Promise<number>
{
	if( ! io) { return 0 }
	const sockets = await io.fetchSockets()
	return sockets.length
}

/*
 * Close — disconnect all clients and shut down
 */
async function close(): Promise<void>
{
	if( ! io) { return }

	await new Promise<void>((resolve) =>
	{
		io!.close(() =>
		{
			socketLog().info('socket.io closed')
			io = undefined
			resolve()
		})
	})
}

export const socketService = { init, server, emit, join, leave, connections, close }
