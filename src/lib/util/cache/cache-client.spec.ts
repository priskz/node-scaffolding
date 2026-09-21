import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/*
 * Cache Client Tests
 *
 * Mocks ioredis — no real Valkey connection.
 * Verifies connect, disconnect, and connected lifecycle.
 */

// Mock ioredis
const mockConnect = vi.fn().mockResolvedValue(undefined)
const mockQuit = vi.fn().mockResolvedValue('OK')
const mockPing = vi.fn().mockResolvedValue('PONG')
const mockOn = vi.fn()

vi.mock('ioredis', () =>
{
	return {
		default: class
		{
			connect = mockConnect
			quit = mockQuit
			ping = mockPing
			on = mockOn
		},
	}
})

// Mock log to prevent initialization errors
vi.mock('~/lib/util/log', () => ({
	log: {
		child: () => ({
			error: vi.fn(),
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
		}),
	},
}))

describe('cacheClient', () =>
{
	let cacheClient: typeof import('./cache-client').cacheClient

	beforeEach(async () =>
	{
		vi.clearAllMocks()

		// Fresh import each test
		const mod = await import('./cache-client')
		cacheClient = mod.cacheClient
	})

	afterEach(async () =>
	{
		// Ensure clean state
		try { await cacheClient.disconnect() } catch { /* ignore */ }
	})

	it('should connect and return true for connected', async () =>
	{
		cacheClient.connect({ host: 'localhost', port: 6379 })
		await mockConnect()

		const result = await cacheClient.connected()

		expect(result).toBe(true)
		expect(mockPing).toHaveBeenCalledOnce()
	})

	it('should return false when not connected', async () =>
	{
		// No connect call — client is undefined
		// Need a fresh module without any prior connect
		vi.resetModules()
		const freshMod = await import('./cache-client')

		const result = await freshMod.cacheClient.connected()

		expect(result).toBe(false)
	})

	it('should disconnect cleanly', async () =>
	{
		cacheClient.connect()

		await cacheClient.disconnect()

		expect(mockQuit).toHaveBeenCalledOnce()
	})

	it('should throw if instance() called before connect', async () =>
	{
		// Fresh module — no connect
		vi.resetModules()
		const freshMod = await import('./cache-client')

		expect(() => freshMod.cacheClient.instance()).toThrow(
			'Cache client not initialized'
		)
	})

	it('should wire up event listeners on connect', () =>
	{
		cacheClient.connect()

		// 5 events: error, connect, ready, close, reconnecting
		expect(mockOn).toHaveBeenCalledTimes(5)
		expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function))
		expect(mockOn).toHaveBeenCalledWith('connect', expect.any(Function))
		expect(mockOn).toHaveBeenCalledWith('ready', expect.any(Function))
	})
})
