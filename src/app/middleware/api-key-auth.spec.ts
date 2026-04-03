import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Hoisted mocks
 */
const { mockValidateApiKey } = vi.hoisted(() => ({
	mockValidateApiKey: vi.fn(),
}))

vi.mock('~/lib/util/api-key', () => ({
	apiKey: {
		validateApiKey: mockValidateApiKey,
	},
}))

import { apiKeyAuth } from './api-key-auth'
import { AuthenticationError } from '~/lib/error'

describe('app/middleware/api-key-auth', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should attach permissions and call next for a valid key', async () =>
	{
		// Init
		const req = { headers: { 'x-api-key': 'valid-key-here' } } as any
		const res = {} as any
		const next = vi.fn()

		mockValidateApiKey.mockResolvedValue({
			id: 'key-1',
			name: 'Test',
			userId: 42,
			permissions: ['content:read'],
		})

		// Action
		await apiKeyAuth(req, res, next)

		// Assert
		expect(req.apiKeyPermissions).toEqual(['content:read'])
		expect(next).toHaveBeenCalled()
	})

	it('should throw AuthenticationError when header is missing', async () =>
	{
		// Init
		const req = { headers: {} } as any
		const res = {} as any
		const next = vi.fn()

		// Action + Assert
		await expect(apiKeyAuth(req, res, next)).rejects.toThrow(AuthenticationError)
		expect(next).not.toHaveBeenCalled()
	})

	it('should throw AuthenticationError when key is invalid', async () =>
	{
		// Init
		const req = { headers: { 'x-api-key': 'invalid-key' } } as any
		const res = {} as any
		const next = vi.fn()

		mockValidateApiKey.mockResolvedValue(undefined)

		// Action + Assert
		await expect(apiKeyAuth(req, res, next)).rejects.toThrow(AuthenticationError)
		expect(next).not.toHaveBeenCalled()
	})
})
