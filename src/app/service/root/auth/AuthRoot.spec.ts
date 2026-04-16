import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockHashMake, mockHashCheck, mockGetOneByEmail, mockUserCreate, mockSessionUpdate, mockSessionExpire } =
	vi.hoisted(() => ({
		mockHashMake: vi.fn(),
		mockHashCheck: vi.fn(),
		mockGetOneByEmail: vi.fn(),
		mockUserCreate: vi.fn(),
		mockSessionUpdate: vi.fn(),
		mockSessionExpire: vi.fn(),
	}))

vi.mock('~/lib/util', () => ({
	crypt: {
		hash: {
			make: mockHashMake,
			check: mockHashCheck,
		},
	},
}))

vi.mock('~/app/service/data', () => ({
	SessionService: class
	{
		public update(data: unknown) { return mockSessionUpdate(data) }
		public expire(id: string) { return mockSessionExpire(id) }
	},
	UserService: class
	{
		public getOneByEmail(email: string) { return mockGetOneByEmail(email) }
		public create(data: unknown) { return mockUserCreate(data) }
	},
}))

import { AuthRoot } from './AuthRoot'

describe('app/service/root/auth/AuthRoot', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should construct', () =>
	{
		const service = new AuthRoot()
		expect(service).toBeInstanceOf(AuthRoot)
	})

	describe('register', () =>
	{
		it('should return undefined when email already registered', async () =>
		{
			mockGetOneByEmail.mockResolvedValue({ id: 1, email: 'a@b.com' })

			const service = new AuthRoot()
			const result = await service.register({ email: 'a@b.com', pass: 'pw' })

			expect(result).toBeUndefined()
			expect(mockUserCreate).not.toHaveBeenCalled()
		})

		it('should hash password and create user when email is new', async () =>
		{
			mockGetOneByEmail.mockResolvedValue(undefined)
			mockHashMake.mockResolvedValue('hashed-pw')
			const created = { id: 2, email: 'new@b.com' }
			mockUserCreate.mockResolvedValue(created)

			const service = new AuthRoot()
			const result = await service.register({ email: 'new@b.com', pass: 'pw' })

			expect(result).toBe(created)
			expect(mockHashMake).toHaveBeenCalledWith('pw')
			expect(mockUserCreate).toHaveBeenCalledWith(expect.objectContaining({
				email: 'new@b.com',
				password: 'hashed-pw',
			}))
		})
	})

	describe('login', () =>
	{
		it('should return undefined when user not found', async () =>
		{
			mockGetOneByEmail.mockResolvedValue(undefined)

			const service = new AuthRoot()
			const result = await service.login({ id: 'sid' } as never, 'none@b.com', 'pw')

			expect(result).toBeUndefined()
		})

		it('should return undefined when user has no password', async () =>
		{
			mockGetOneByEmail.mockResolvedValue({ id: 1, email: 'a@b.com', password: null })

			const service = new AuthRoot()
			const result = await service.login({ id: 'sid' } as never, 'a@b.com', 'pw')

			expect(result).toBeUndefined()
		})

		it('should return undefined when password is invalid', async () =>
		{
			mockGetOneByEmail.mockResolvedValue({ id: 1, email: 'a@b.com', password: 'hash' })
			mockHashCheck.mockResolvedValue(false)

			const service = new AuthRoot()
			const result = await service.login({ id: 'sid' } as never, 'a@b.com', 'pw')

			expect(result).toBeUndefined()
			expect(mockSessionUpdate).not.toHaveBeenCalled()
		})

		it('should attach user to session on valid credentials', async () =>
		{
			mockGetOneByEmail.mockResolvedValue({ id: 1, email: 'a@b.com', password: 'hash' })
			mockHashCheck.mockResolvedValue(true)
			const updated = { id: 'sid', userId: 1 }
			mockSessionUpdate.mockResolvedValue(updated)

			const service = new AuthRoot()
			const result = await service.login({ id: 'sid' } as never, 'a@b.com', 'pw')

			expect(result).toBe(updated)
			expect(mockSessionUpdate).toHaveBeenCalledWith({ id: 'sid', userId: 1 })
		})
	})

	describe('logout', () =>
	{
		it('should expire the session and return the result', async () =>
		{
			mockSessionExpire.mockResolvedValue(true)

			const service = new AuthRoot()
			const ok = await service.logout({ id: 'sid' } as never)

			expect(ok).toBe(true)
			expect(mockSessionExpire).toHaveBeenCalledWith('sid')
		})
	})
})
