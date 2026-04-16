import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCreate, mockGetOne, mockUpdate, mockTimeNow } = vi.hoisted(() => ({
	mockCreate: vi.fn(),
	mockGetOne: vi.fn(),
	mockUpdate: vi.fn(),
	mockTimeNow: vi.fn(),
}))

vi.mock('~/config', () => ({
	config: { session: { duration: { guest: 7 } } },
}))

vi.mock('~/lib/util', () => ({
	time: { now: mockTimeNow },
}))

vi.mock('~/app/service/data', () => ({
	SessionService: class
	{
		public create(data: unknown) { return mockCreate(data) }
		public getOne(query: unknown) { return mockGetOne(query) }
		public update(data: unknown) { return mockUpdate(data) }
	},
}))

import { SessionRoot } from './SessionRoot'

describe('app/service/root/session/SessionRoot', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should construct', () =>
	{
		const service = new SessionRoot()
		expect(service).toBeInstanceOf(SessionRoot)
	})

	describe('generate', () =>
	{
		it('should create a session with guest duration expiration', async () =>
		{
			const expires = new Date('2026-01-08T00:00:00Z')
			mockTimeNow.mockReturnValue({
				plus: vi.fn(() => ({ toJSDate: () => expires })),
			})
			const created = { id: 'sid', expiresAt: expires }
			mockCreate.mockResolvedValue(created)

			const service = new SessionRoot()
			const result = await service.generate('mozilla', '1.2.3.4')

			expect(result).toBe(created)
			expect(mockCreate).toHaveBeenCalledWith({
				agent: 'mozilla',
				ipAddress: '1.2.3.4',
				expiresAt: expires,
			})
		})
	})

	describe('getOneById', () =>
	{
		it('should fetch with user embedded', async () =>
		{
			const session = { id: 'sid' }
			mockGetOne.mockResolvedValue(session)

			const service = new SessionRoot()
			const result = await service.getOneById('sid')

			expect(result).toBe(session)
			expect(mockGetOne).toHaveBeenCalledWith({ where: { id: 'sid' }, embed: ['user'] })
		})
	})

	describe('touch', () =>
	{
		it('should update activeAt to current time', async () =>
		{
			const now = new Date('2026-01-01T00:00:00Z')
			mockTimeNow.mockReturnValue({ toJSDate: () => now })
			mockUpdate.mockResolvedValue({ id: 'sid' })

			const service = new SessionRoot()
			await service.touch('sid')

			expect(mockUpdate).toHaveBeenCalledWith({ id: 'sid', activeAt: now })
		})
	})
})
