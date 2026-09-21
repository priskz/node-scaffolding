import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Remember Pattern Tests
 *
 * Mocks the cache client to verify hit/miss behavior.
 */

const mockGet = vi.fn()
const mockSet = vi.fn()

vi.mock('./cache-client', () => ({
	cacheClient: {
		instance: () => ({
			get: mockGet,
			set: mockSet,
		}),
	},
}))

describe('remember', () =>
{
	let remember: typeof import('./remember').remember

	beforeEach(async () =>
	{
		vi.clearAllMocks()

		const mod = await import('./remember')
		remember = mod.remember
	})

	it('should return cached value on hit', async () =>
	{
		// Simulate cache hit
		mockGet.mockResolvedValueOnce(JSON.stringify({ name: 'cached' }))

		const factory = vi.fn()

		const result = await remember('test-key', 60, factory)

		expect(result).toEqual({ name: 'cached' })
		expect(factory).not.toHaveBeenCalled()
		expect(mockSet).not.toHaveBeenCalled()
	})

	it('should call factory on miss and cache the result', async () =>
	{
		// Simulate cache miss
		mockGet.mockResolvedValueOnce(null)
		mockSet.mockResolvedValueOnce('OK')

		const factory = vi.fn().mockResolvedValueOnce({ name: 'fresh' })

		const result = await remember('test-key', 300, factory)

		expect(result).toEqual({ name: 'fresh' })
		expect(factory).toHaveBeenCalledOnce()
		expect(mockSet).toHaveBeenCalledWith(
			'test-key',
			JSON.stringify({ name: 'fresh' }),
			'EX',
			300
		)
	})

	it('should set without TTL when ttl is 0', async () =>
	{
		// Simulate cache miss
		mockGet.mockResolvedValueOnce(null)
		mockSet.mockResolvedValueOnce('OK')

		const factory = vi.fn().mockResolvedValueOnce('no-expiry')

		await remember('forever-key', 0, factory)

		expect(mockSet).toHaveBeenCalledWith(
			'forever-key',
			JSON.stringify('no-expiry')
		)
	})

	it('should not cache when factory throws', async () =>
	{
		// Simulate cache miss
		mockGet.mockResolvedValueOnce(null)

		const factory = vi.fn().mockRejectedValueOnce(new Error('db down'))

		await expect(remember('fail-key', 60, factory)).rejects.toThrow('db down')

		expect(mockSet).not.toHaveBeenCalled()
	})
})
