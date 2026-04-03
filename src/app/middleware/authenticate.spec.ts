import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Hoisted mocks
 */
const { mockVerifyToken, mockValidateApiKey } = vi.hoisted(() => ({
	mockVerifyToken: vi.fn(),
	mockValidateApiKey: vi.fn(),
}))

vi.mock('~/lib/util', () => ({
	jwt: {
		verifyToken: mockVerifyToken,
	},
}))

vi.mock('~/lib/util/api-key', () => ({
	apiKey: {
		validateApiKey: mockValidateApiKey,
	},
}))

import { authenticate } from './authenticate'
import { AuthenticationError } from '~/lib/error'

describe('app/middleware/authenticate', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should authenticate via JWT when Bearer token is valid', async () =>
	{
		// Init
		const req = { headers: { authorization: 'Bearer valid-token' } } as any
		const res = {} as any
		const next = vi.fn()

		mockVerifyToken.mockResolvedValue({ sub: '42', type: 'access' })

		// Action
		await authenticate(req, res, next)

		// Assert
		expect(req.jwtPayload).toEqual({ sub: '42', type: 'access' })
		expect(next).toHaveBeenCalled()
		expect(mockValidateApiKey).not.toHaveBeenCalled()
	})

	it('should fall through to API key when JWT is invalid', async () =>
	{
		// Init
		const req = {
			headers: {
				authorization: 'Bearer bad-token',
				'x-api-key': 'valid-api-key',
			},
		} as any
		const res = {} as any
		const next = vi.fn()

		mockVerifyToken.mockResolvedValue(undefined)
		mockValidateApiKey.mockResolvedValue({
			id: 'key-1',
			name: 'Test',
			userId: 42,
			permissions: ['content:read'],
		})

		// Action
		await authenticate(req, res, next)

		// Assert
		expect(req.apiKeyPermissions).toEqual(['content:read'])
		expect(next).toHaveBeenCalled()
	})

	it('should authenticate via API key when no Bearer header present', async () =>
	{
		// Init
		const req = { headers: { 'x-api-key': 'valid-api-key' } } as any
		const res = {} as any
		const next = vi.fn()

		mockValidateApiKey.mockResolvedValue({
			id: 'key-1',
			name: 'Test',
			userId: 42,
			permissions: ['*'],
		})

		// Action
		await authenticate(req, res, next)

		// Assert
		expect(req.apiKeyPermissions).toEqual(['*'])
		expect(next).toHaveBeenCalled()
	})

	it('should reject refresh tokens used as access tokens', async () =>
	{
		// Init
		const req = { headers: { authorization: 'Bearer refresh-token' } } as any
		const res = {} as any
		const next = vi.fn()

		mockVerifyToken.mockResolvedValue({ sub: '42', type: 'refresh' })

		// Action + Assert — should fall through JWT, and with no API key, throw
		await expect(authenticate(req, res, next)).rejects.toThrow(AuthenticationError)
	})

	it('should throw AuthenticationError when neither strategy succeeds', async () =>
	{
		// Init
		const req = { headers: {} } as any
		const res = {} as any
		const next = vi.fn()

		// Action + Assert
		await expect(authenticate(req, res, next)).rejects.toThrow(AuthenticationError)
		expect(next).not.toHaveBeenCalled()
	})

	it('should throw when both strategies are present but both invalid', async () =>
	{
		// Init
		const req = {
			headers: {
				authorization: 'Bearer invalid',
				'x-api-key': 'also-invalid',
			},
		} as any
		const res = {} as any
		const next = vi.fn()

		mockVerifyToken.mockResolvedValue(undefined)
		mockValidateApiKey.mockResolvedValue(undefined)

		// Action + Assert
		await expect(authenticate(req, res, next)).rejects.toThrow(AuthenticationError)
		expect(next).not.toHaveBeenCalled()
	})
})
