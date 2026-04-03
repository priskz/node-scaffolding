import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Mock socket.io — before any imports that reference it
 */
const mockOn = vi.fn()
const mockEmit = vi.fn()
const mockTo = vi.fn(() => ({ emit: mockEmit }))
const mockClose = vi.fn((cb: () => void) => cb())
const mockFetchSockets = vi.fn(() => Promise.resolve([]))
const mockSocketsGet = vi.fn()

const mockIo = {
	on: mockOn,
	emit: mockEmit,
	to: mockTo,
	close: mockClose,
	fetchSockets: mockFetchSockets,
	sockets: { sockets: { get: mockSocketsGet } },
}

vi.mock('socket.io', () =>
{
	function MockServer(): typeof mockIo
	{
		return mockIo
	}

	return { Server: MockServer }
})

vi.mock('~/lib/util/log', () =>
{
	const child = vi.fn(() => ({
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	}))

	return { log: { child } }
})

import { socketService } from './socket-service'
import { createServer } from 'http'

describe('SocketService', () =>
{
	let httpServer: ReturnType<typeof createServer>

	beforeEach(async () =>
	{
		vi.clearAllMocks()

		// Reset module state between tests
		await socketService.close()
		httpServer = createServer()
	})

	it('should initialize with an HTTP server', () =>
	{
		const result = socketService.init(httpServer)

		expect(result).toBe(mockIo)
		expect(mockOn).toHaveBeenCalledWith('connection', expect.any(Function))
	})

	it('should return existing server on repeated init', () =>
	{
		const first = socketService.init(httpServer)

		vi.clearAllMocks()
		const second = socketService.init(httpServer)

		expect(first).toBe(second)
		// Second init should not re-register the connection handler
		expect(mockOn).not.toHaveBeenCalled()
	})

	it('should return the server instance', () =>
	{
		socketService.init(httpServer)
		const result = socketService.server()

		expect(result).toBe(mockIo)
	})

	it('should emit to all clients', () =>
	{
		socketService.init(httpServer)
		socketService.emit('test-event', { foo: 'bar' })

		expect(mockEmit).toHaveBeenCalledWith('test-event', { foo: 'bar' })
	})

	it('should emit to a specific room', () =>
	{
		socketService.init(httpServer)
		socketService.emit('room-event', { data: 1 }, { room: 'room-1' })

		expect(mockTo).toHaveBeenCalledWith('room-1')
		expect(mockEmit).toHaveBeenCalledWith('room-event', { data: 1 })
	})

	it('should join a socket to a room', async () =>
	{
		const mockJoin = vi.fn()
		mockSocketsGet.mockReturnValue({ join: mockJoin })

		socketService.init(httpServer)
		await socketService.join('socket-1', 'room-a')

		expect(mockSocketsGet).toHaveBeenCalledWith('socket-1')
		expect(mockJoin).toHaveBeenCalledWith('room-a')
	})

	it('should handle join for missing socket gracefully', async () =>
	{
		mockSocketsGet.mockReturnValue(undefined)

		socketService.init(httpServer)
		await socketService.join('missing', 'room-a')

		// No throw — logged a warning
		expect(mockSocketsGet).toHaveBeenCalledWith('missing')
	})

	it('should leave a room', async () =>
	{
		const mockLeave = vi.fn()
		mockSocketsGet.mockReturnValue({ leave: mockLeave })

		socketService.init(httpServer)
		await socketService.leave('socket-1', 'room-a')

		expect(mockLeave).toHaveBeenCalledWith('room-a')
	})

	it('should return connection count', async () =>
	{
		mockFetchSockets.mockResolvedValue([{}, {}, {}])

		socketService.init(httpServer)
		const count = await socketService.connections()

		expect(count).toBe(3)
	})

	it('should close and clear the server', async () =>
	{
		socketService.init(httpServer)
		await socketService.close()

		expect(mockClose).toHaveBeenCalled()
	})
})
