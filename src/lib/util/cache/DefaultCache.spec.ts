import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSelect, mockSet, mockGet, mockDel, mockKeys, mockInstance, mockLogError } =
	vi.hoisted(() => ({
		mockSelect: vi.fn(),
		mockSet: vi.fn(),
		mockGet: vi.fn(),
		mockDel: vi.fn(),
		mockKeys: vi.fn(),
		mockInstance: vi.fn(),
		mockLogError: vi.fn(),
	}))

vi.mock('./cache-client', () => ({
	cacheClient: {
		instance: mockInstance,
	},
}))

vi.mock('~/lib/util/log', () => ({
	log: { error: mockLogError },
}))

import { DefaultCache } from './DefaultCache'

describe('lib/util/cache/DefaultCache', () =>
{
	const fakeRedis = {
		select: mockSelect,
		set: mockSet,
		get: mockGet,
		del: mockDel,
		keys: mockKeys,
	}

	beforeEach(() =>
	{
		vi.clearAllMocks()
		mockInstance.mockReturnValue(fakeRedis)
		mockSelect.mockResolvedValue('OK')
	})

	describe('set', () =>
	{
		it('should select the configured db and SET when no TTL', async () =>
		{
			mockSet.mockResolvedValue('OK')

			class TestCache extends DefaultCache {
				protected prefix = 'test'
				protected db = 2
			}
			const cache = new TestCache()

			const ok = await cache.set('abc', { hello: 'world' })

			expect(ok).toBe(true)
			expect(mockSelect).toHaveBeenCalledWith(2)
			expect(mockSet).toHaveBeenCalledWith('test:abc', JSON.stringify({ hello: 'world' }))
		})

		it('should pass through string values without re-serializing', async () =>
		{
			mockSet.mockResolvedValue('OK')

			const cache = new DefaultCache({ prefix: 'x' })
			await cache.set('k', 'raw-string')

			expect(mockSet).toHaveBeenCalledWith('x:k', 'raw-string')
		})

		it('should use EX when TTL is configured', async () =>
		{
			mockSet.mockResolvedValue('OK')

			const cache = new DefaultCache({ prefix: 'x', ttl: 60 })
			await cache.set('k', 'v')

			expect(mockSet).toHaveBeenCalledWith('x:k', 'v', 'EX', 60)
		})

		it('should return false and log when SET returns non-OK', async () =>
		{
			mockSet.mockResolvedValue(null)

			const cache = new DefaultCache({ prefix: 'x' })
			const ok = await cache.set('k', 'v')

			expect(ok).toBe(false)
		})

		it('should return false and log when stringify throws (circular ref)', async () =>
		{
			const cache = new DefaultCache({ prefix: 'x' })
			const circular: Record<string, unknown> = {}
			circular.self = circular

			const ok = await cache.set('k', circular)

			expect(ok).toBe(false)
			expect(mockLogError).toHaveBeenCalled()
		})
	})

	describe('getRaw / get', () =>
	{
		it('getRaw should return the raw string', async () =>
		{
			mockGet.mockResolvedValue('hello')

			const cache = new DefaultCache({ prefix: 'x' })
			const value = await cache.getRaw('k')

			expect(value).toBe('hello')
			expect(mockGet).toHaveBeenCalledWith('x:k')
		})

		it('get should return null when key is missing', async () =>
		{
			mockGet.mockResolvedValue(null)

			const cache = new DefaultCache({ prefix: 'x' })
			const value = await cache.get('k')

			expect(value).toBeNull()
		})

		it('get should parse JSON when value is valid', async () =>
		{
			mockGet.mockResolvedValue(JSON.stringify({ a: 1 }))

			const cache = new DefaultCache({ prefix: 'x' })
			const value = await cache.get<{ a: number }>('k')

			expect(value).toEqual({ a: 1 })
		})

		it('get should return null when JSON is invalid', async () =>
		{
			mockGet.mockResolvedValue('not-json')

			const cache = new DefaultCache({ prefix: 'x' })
			const value = await cache.get('k')

			expect(value).toBeNull()
		})
	})

	describe('remove', () =>
	{
		it('should DEL the prefixed key and return true on 1+ deletions', async () =>
		{
			mockDel.mockResolvedValue(1)

			const cache = new DefaultCache({ prefix: 'x' })
			const ok = await cache.remove('k')

			expect(ok).toBe(true)
			expect(mockDel).toHaveBeenCalledWith('x:k')
		})

		it('should return false when nothing was deleted', async () =>
		{
			mockDel.mockResolvedValue(0)

			const cache = new DefaultCache({ prefix: 'x' })
			const ok = await cache.remove('k')

			expect(ok).toBe(false)
		})
	})

	describe('keys / flush', () =>
	{
		it('keys() should scan with the prefix wildcard', async () =>
		{
			mockKeys.mockResolvedValue(['x:a', 'x:b'])

			const cache = new DefaultCache({ prefix: 'x' })
			const result = await cache.keys()

			expect(mockKeys).toHaveBeenCalledWith('x:*')
			expect(result).toEqual(['x:a', 'x:b'])
		})

		it('flush() should return true when there are no matching keys', async () =>
		{
			mockKeys.mockResolvedValue([])

			const cache = new DefaultCache({ prefix: 'x' })
			const ok = await cache.flush()

			expect(ok).toBe(true)
			expect(mockDel).not.toHaveBeenCalled()
		})

		it('flush() should DEL all matching keys', async () =>
		{
			mockKeys.mockResolvedValue(['x:a', 'x:b'])
			mockDel.mockResolvedValue(2)

			const cache = new DefaultCache({ prefix: 'x' })
			const ok = await cache.flush()

			expect(ok).toBe(true)
			expect(mockDel).toHaveBeenCalledWith('x:a', 'x:b')
		})

		it('flush(pattern) should honor an explicit pattern', async () =>
		{
			mockKeys.mockResolvedValue(['foo:1'])
			mockDel.mockResolvedValue(1)

			const cache = new DefaultCache({ prefix: 'x' })
			await cache.flush('foo:*')

			expect(mockKeys).toHaveBeenCalledWith('foo:*')
			expect(mockDel).toHaveBeenCalledWith('foo:1')
		})
	})

	describe('parseKey', () =>
	{
		it('should prefix with colon separator', () =>
		{
			const cache = new DefaultCache({ prefix: 'user' })
			expect(cache.parseKey(42)).toBe('user:42')
		})

		it('should return id-as-string when no prefix configured', () =>
		{
			const cache = new DefaultCache()
			expect(cache.parseKey('bare')).toBe('bare')
		})
	})
})
