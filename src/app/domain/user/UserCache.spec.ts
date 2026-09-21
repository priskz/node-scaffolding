import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetRaw = vi.fn()
const mockSet = vi.fn()
const mockFindOneById = vi.fn()

vi.mock('~/lib/util', () => ({
	DefaultCache: class
	{
		protected prefix = ''
		protected db = 0
		public getRaw(id: string | number) { return mockGetRaw(id) }
		public set(id: string | number, data: unknown) { return mockSet(id, data) }
	},
}))

vi.mock('~/app/domain/user/UserRepository', () => ({
	UserRepository: class { public findOneById(id: number) { return mockFindOneById(id) } },
}))

import { UserCache } from './UserCache'

describe('app/domain/user/UserCache', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	describe('configuration', () =>
	{
		it('should use user prefix and db 1', () =>
		{
			const cache = new UserCache()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect((cache as any).prefix).toBe('user')
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect((cache as any).db).toBe(1)
		})
	})

	describe('fetch', () =>
	{
		it('should return parsed user when cache hit', async () =>
		{
			const user = { id: 1, email: 'a@b.com' }
			mockGetRaw.mockResolvedValue(JSON.stringify(user))

			const cache = new UserCache()
			const result = await cache.fetch(1)

			expect(result).toEqual(user)
			expect(mockFindOneById).not.toHaveBeenCalled()
			expect(mockSet).not.toHaveBeenCalled()
		})

		it('should load from source and cache when cache miss with shouldCache=true', async () =>
		{
			const user = { id: 2, email: 'a@b.com' }
			mockGetRaw.mockResolvedValue(null)
			mockFindOneById.mockResolvedValue(user)
			mockSet.mockResolvedValue(true)

			const cache = new UserCache()
			const result = await cache.fetch(2)

			expect(result).toEqual(user)
			expect(mockFindOneById).toHaveBeenCalledWith(2)
			expect(mockSet).toHaveBeenCalledWith(2, JSON.stringify(user))
		})

		it('should return undefined on cache miss when shouldCache=false', async () =>
		{
			mockGetRaw.mockResolvedValue(null)

			const cache = new UserCache()
			const result = await cache.fetch(3, false)

			expect(result).toBeUndefined()
			expect(mockFindOneById).not.toHaveBeenCalled()
		})

		it('should return undefined when source miss', async () =>
		{
			mockGetRaw.mockResolvedValue(null)
			mockFindOneById.mockResolvedValue(undefined)

			const cache = new UserCache()
			const result = await cache.fetch(4)

			expect(result).toBeUndefined()
			expect(mockSet).not.toHaveBeenCalled()
		})
	})

	describe('saveById', () =>
	{
		it('should cache the user looked up by id', async () =>
		{
			const user = { id: 5, email: 'c@d.com' }
			mockFindOneById.mockResolvedValue(user)
			mockSet.mockResolvedValue(true)

			const cache = new UserCache()
			const ok = await cache.saveById(5)

			expect(ok).toBe(true)
			expect(mockSet).toHaveBeenCalledWith(5, JSON.stringify(user))
		})

		it('should return false when user not found', async () =>
		{
			mockFindOneById.mockResolvedValue(undefined)

			const cache = new UserCache()
			const ok = await cache.saveById(6)

			expect(ok).toBe(false)
			expect(mockSet).not.toHaveBeenCalled()
		})
	})

	describe('save', () =>
	{
		it('should cache the given user', async () =>
		{
			const user = { id: 7, email: 'e@f.com' }
			mockSet.mockResolvedValue(true)

			const cache = new UserCache()
			const ok = await cache.save(user as never)

			expect(ok).toBe(true)
			expect(mockSet).toHaveBeenCalledWith(7, JSON.stringify(user))
		})

		it('should refresh from source when refresh=true', async () =>
		{
			const stale = { id: 8, email: 'g@h.com' }
			const fresh = { id: 8, email: 'fresh@example.com' }
			mockFindOneById.mockResolvedValue(fresh)
			mockSet.mockResolvedValue(true)

			const cache = new UserCache()
			const ok = await cache.save(stale as never, true)

			expect(ok).toBe(true)
			expect(mockSet).toHaveBeenCalledWith(8, JSON.stringify(fresh))
		})

		it('should return false when refresh finds no source', async () =>
		{
			mockFindOneById.mockResolvedValue(undefined)

			const cache = new UserCache()
			const ok = await cache.save({ id: 9 } as never, true)

			expect(ok).toBe(false)
			expect(mockSet).not.toHaveBeenCalled()
		})
	})
})
