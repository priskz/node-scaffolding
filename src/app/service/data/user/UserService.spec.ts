import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetOne = vi.fn()

vi.mock('~/lib/service/DataService', () => ({
	DataService: class
	{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		protected repository: any
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		constructor(repository: any) { this.repository = repository }
		public getOne(query: unknown) { return mockGetOne(query) }
	},
}))

vi.mock('~/app/domain', () => ({
	UserRepository: class {},
}))

import { UserService } from './UserService'

describe('app/service/data/user/UserService', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should construct with a UserRepository', () =>
	{
		const service = new UserService()
		expect(service).toBeInstanceOf(UserService)
	})

	describe('getOneByEmail', () =>
	{
		it('should delegate to getOne filtered by email', async () =>
		{
			const user = { id: 1, email: 'user@example.com' }
			mockGetOne.mockResolvedValue(user)

			const service = new UserService()
			const result = await service.getOneByEmail('user@example.com')

			expect(result).toBe(user)
			expect(mockGetOne).toHaveBeenCalledWith({ where: { email: 'user@example.com' } })
		})

		it('should return undefined when no match', async () =>
		{
			mockGetOne.mockResolvedValue(undefined)

			const service = new UserService()
			const result = await service.getOneByEmail('none@example.com')

			expect(result).toBeUndefined()
		})
	})
})
