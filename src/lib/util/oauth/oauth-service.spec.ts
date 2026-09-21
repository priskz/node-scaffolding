import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Hoisted mocks
 */
const {
	mockFindUniqueOAuth,
	mockCreateOAuth,
	mockDeleteOAuth,
	mockFindManyOAuth,
	mockFindFirstOAuth,
	mockFindUniqueUser,
	mockCreateUser,
	mockTransaction,
	mockPassportUse,
} = vi.hoisted(() => ({
	mockFindUniqueOAuth: vi.fn(),
	mockCreateOAuth: vi.fn(),
	mockDeleteOAuth: vi.fn(),
	mockFindManyOAuth: vi.fn(),
	mockFindFirstOAuth: vi.fn(),
	mockFindUniqueUser: vi.fn(),
	mockCreateUser: vi.fn(),
	mockTransaction: vi.fn(),
	mockPassportUse: vi.fn(),
}))

vi.mock('~/lib/util/database', () => ({
	database: {
		client: () => ({
			oAuthAccount: {
				findUnique: mockFindUniqueOAuth,
				create: mockCreateOAuth,
				delete: mockDeleteOAuth,
				findMany: mockFindManyOAuth,
				findFirst: mockFindFirstOAuth,
			},
			user: {
				findUnique: mockFindUniqueUser,
				create: mockCreateUser,
			},
			$transaction: mockTransaction,
		}),
	},
}))

vi.mock('~/lib/util/log', () => ({
	log: {
		child: () => ({
			info: vi.fn(),
			debug: vi.fn(),
			error: vi.fn(),
		}),
	},
}))

vi.mock('passport', () => ({
	default: { use: mockPassportUse },
}))

vi.mock('passport-google-oauth20', () => ({
	Strategy: vi.fn(),
}))

vi.mock('passport-github2', () => ({
	Strategy: vi.fn(),
}))

import { oauth } from './oauth-service'
import type { OAuthProfile } from './types'

const _mockProfile: OAuthProfile =
{
	provider: 'google',
	providerId: 'google-123',
	email: 'test@example.com',
	firstName: 'Test',
	lastName: 'User',
	raw: { sub: 'google-123' },
}

describe('lib/util/oauth/oauth-service', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	describe('findOrCreateUser', () =>
	{
		it('should return existing link when OAuth account already exists', async () =>
		{
			// Init
			mockFindUniqueOAuth.mockResolvedValue({
				userId: 42,
				provider: 'google',
				providerId: 'google-123',
			})

			// Action
			const result = await oauth.findOrCreateUser(_mockProfile)

			// Assert
			expect(result.userId).toBe(42)
			expect(result.created).toBe(false)
			expect(mockFindUniqueUser).not.toHaveBeenCalled()
		})

		it('should link to existing user when email matches', async () =>
		{
			// Init
			mockFindUniqueOAuth.mockResolvedValue(null)
			mockFindUniqueUser.mockResolvedValue({ id: 99, email: 'test@example.com' })
			mockCreateOAuth.mockResolvedValue({})

			// Action
			const result = await oauth.findOrCreateUser(_mockProfile)

			// Assert
			expect(result.userId).toBe(99)
			expect(result.created).toBe(false)
			expect(mockCreateOAuth).toHaveBeenCalledWith(expect.objectContaining({
				data: expect.objectContaining({
					provider: 'google',
					providerId: 'google-123',
					userId: 99,
				}),
			}))
		})

		it('should create new user and link when no match exists', async () =>
		{
			// Init
			mockFindUniqueOAuth.mockResolvedValue(null)
			mockFindUniqueUser.mockResolvedValue(null)
			mockTransaction.mockImplementation(async (fn: (tx: any) => Promise<any>) =>
			{
				return fn({
					user: { create: vi.fn().mockResolvedValue({ id: 200, email: 'test@example.com' }) },
					oAuthAccount: { create: vi.fn().mockResolvedValue({}) },
				})
			})

			// Action
			const result = await oauth.findOrCreateUser(_mockProfile)

			// Assert
			expect(result.userId).toBe(200)
			expect(result.created).toBe(true)
		})
	})

	describe('linkAccount', () =>
	{
		it('should return without creating when already linked to same user', async () =>
		{
			// Init
			mockFindUniqueOAuth.mockResolvedValue({
				userId: 42,
				provider: 'google',
				providerId: 'google-123',
			})

			// Action
			const result = await oauth.linkAccount(42, _mockProfile)

			// Assert
			expect(result.created).toBe(false)
			expect(mockCreateOAuth).not.toHaveBeenCalled()
		})

		it('should throw when OAuth account is linked to another user', async () =>
		{
			// Init
			mockFindUniqueOAuth.mockResolvedValue({
				userId: 99,
				provider: 'google',
				providerId: 'google-123',
			})

			// Action + Assert
			await expect(oauth.linkAccount(42, _mockProfile))
				.rejects.toThrow('OAuth account already linked to another user')
		})

		it('should create link when no existing link', async () =>
		{
			// Init
			mockFindUniqueOAuth.mockResolvedValue(null)
			mockCreateOAuth.mockResolvedValue({})

			// Action
			const result = await oauth.linkAccount(42, _mockProfile)

			// Assert
			expect(result.created).toBe(true)
			expect(result.userId).toBe(42)
		})
	})

	describe('unlinkAccount', () =>
	{
		it('should return true when account is unlinked', async () =>
		{
			// Init
			mockFindFirstOAuth.mockResolvedValue({ id: 'acc-1', userId: 42, provider: 'google' })
			mockDeleteOAuth.mockResolvedValue({})

			// Action
			const result = await oauth.unlinkAccount(42, 'google')

			// Assert
			expect(result).toBe(true)
			expect(mockDeleteOAuth).toHaveBeenCalledWith({ where: { id: 'acc-1' } })
		})

		it('should return false when no link found', async () =>
		{
			// Init
			mockFindFirstOAuth.mockResolvedValue(null)

			// Action
			const result = await oauth.unlinkAccount(42, 'google')

			// Assert
			expect(result).toBe(false)
		})
	})

	describe('getLinkedProviders', () =>
	{
		it('should return list of linked provider names', async () =>
		{
			// Init
			mockFindManyOAuth.mockResolvedValue([
				{ provider: 'google' },
				{ provider: 'github' },
			])

			// Action
			const result = await oauth.getLinkedProviders(42)

			// Assert
			expect(result).toEqual(['google', 'github'])
		})

		it('should return empty array when no providers linked', async () =>
		{
			// Init
			mockFindManyOAuth.mockResolvedValue([])

			// Action
			const result = await oauth.getLinkedProviders(42)

			// Assert
			expect(result).toEqual([])
		})
	})

	describe('registerGoogle', () =>
	{
		it('should register Google strategy with passport', () =>
		{
			// Action — should not throw
			oauth.registerGoogle({
				clientId: 'test-id',
				clientSecret: 'test-secret',
				callbackUrl: '/auth/google/callback',
			})

			// Assert — passport.use was called
			expect(mockPassportUse).toHaveBeenCalled()
		})
	})

	describe('registerGitHub', () =>
	{
		it('should register GitHub strategy with passport', () =>
		{
			// Action — should not throw
			oauth.registerGitHub({
				clientId: 'test-id',
				clientSecret: 'test-secret',
				callbackUrl: '/auth/github/callback',
			})

			// Assert — passport.use was called
			expect(mockPassportUse).toHaveBeenCalled()
		})
	})
})
