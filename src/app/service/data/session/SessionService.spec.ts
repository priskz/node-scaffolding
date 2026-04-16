import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGetOne, mockRepoUpdate, mockTimeNow } = vi.hoisted(() => ({
	mockGetOne: vi.fn(),
	mockRepoUpdate: vi.fn(),
	mockTimeNow: vi.fn(),
}))

vi.mock('~/lib/service/DataService', () => ({
	DataService: class
	{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		protected repository: any
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		constructor(repository: any)
		{
			this.repository = { update: mockRepoUpdate }
		}
		public getOne(query: unknown) { return mockGetOne(query) }
	},
}))

vi.mock('~/lib/util', () => ({
	time: { now: mockTimeNow },
}))

vi.mock('~/app/domain', () => ({
	SessionRepository: class {},
}))

import { SessionService } from './SessionService'

describe('app/service/data/session/SessionService', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should construct with a SessionRepository', () =>
	{
		const service = new SessionService()
		expect(service).toBeInstanceOf(SessionService)
	})

	describe('getOneById', () =>
	{
		it('should delegate to getOne filtered by id', async () =>
		{
			const session = { id: 'abc' }
			mockGetOne.mockResolvedValue(session)

			const service = new SessionService()
			const result = await service.getOneById('abc')

			expect(result).toBe(session)
			expect(mockGetOne).toHaveBeenCalledWith({ where: { id: 'abc' } })
		})
	})

	describe('expire', () =>
	{
		it('should update expiresAt to now and return true on success', async () =>
		{
			const fixedDate = new Date('2026-01-01T00:00:00Z')
			mockTimeNow.mockReturnValue({ toJSDate: () => fixedDate })
			mockRepoUpdate.mockResolvedValue({ id: 'abc' })

			const service = new SessionService()
			const ok = await service.expire('abc')

			expect(ok).toBe(true)
			expect(mockRepoUpdate).toHaveBeenCalledWith({ id: 'abc', expiresAt: fixedDate })
		})

		it('should return false when update yields no result', async () =>
		{
			mockTimeNow.mockReturnValue({ toJSDate: () => new Date() })
			mockRepoUpdate.mockResolvedValue(undefined)

			const service = new SessionService()
			const ok = await service.expire('abc')

			expect(ok).toBe(false)
		})
	})
})
