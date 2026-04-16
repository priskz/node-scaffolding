import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockConnect, mockDisconnect, mockConnected, mockInstance, mockClientConnect } =
	vi.hoisted(() => ({
		mockConnect: vi.fn(),
		mockDisconnect: vi.fn(),
		mockConnected: vi.fn(),
		mockInstance: vi.fn(),
		mockClientConnect: vi.fn(),
	}))

vi.mock('./cache-client', () => ({
	cacheClient: {
		connect: mockConnect,
		disconnect: mockDisconnect,
		connected: mockConnected,
		instance: mockInstance,
	},
}))

import { cache } from './cache'

describe('lib/util/cache/cache — facade', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	describe('connect', () =>
	{
		it('should call cacheClient.connect, wait for connection, and return connected()', async () =>
		{
			const fakeClient = { connect: mockClientConnect }
			mockConnect.mockReturnValue(fakeClient)
			mockClientConnect.mockResolvedValue(undefined)
			mockConnected.mockResolvedValue(true)

			const ok = await cache.connect({ host: 'redis', port: 6379 })

			expect(mockConnect).toHaveBeenCalledWith({ host: 'redis', port: 6379 })
			expect(mockClientConnect).toHaveBeenCalled()
			expect(ok).toBe(true)
		})

		it('should return false when cacheClient reports not-connected', async () =>
		{
			mockConnect.mockReturnValue({ connect: mockClientConnect })
			mockClientConnect.mockResolvedValue(undefined)
			mockConnected.mockResolvedValue(false)

			const ok = await cache.connect()

			expect(ok).toBe(false)
		})
	})

	describe('disconnect', () =>
	{
		it('should delegate to cacheClient.disconnect', async () =>
		{
			mockDisconnect.mockResolvedValue(undefined)

			await cache.disconnect()

			expect(mockDisconnect).toHaveBeenCalled()
		})
	})

	describe('client', () =>
	{
		it('should expose cacheClient.instance as client', () =>
		{
			expect(cache.client).toBe(mockInstance)
		})
	})
})
