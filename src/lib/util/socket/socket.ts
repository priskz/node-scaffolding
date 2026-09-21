import { socketService } from './socket-service'

/*
 * Socket Facade
 *
 * Public API for socket.io operations.
 * Delegates to socketService for all real work.
 */
export const socket = {
	init: socketService.init,
	server: socketService.server,
	emit: socketService.emit,
	join: socketService.join,
	leave: socketService.leave,
	connections: socketService.connections,
	close: socketService.close,
}
