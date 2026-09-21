import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Hoisted mocks
 */
const { mockHasTotpEnabled } = vi.hoisted(() => ({
	mockHasTotpEnabled: vi.fn(),
}))

vi.mock('~/lib/util/totp', () => ({
	totp: {
		hasTotpEnabled: mockHasTotpEnabled,
	},
}))

import { require2FA } from './require-2fa'
import { AuthenticationError } from '~/lib/error'
import type { Request, Response, NextFunction } from 'express'

function _mockReq(overrides: Partial<Request> = {}): Partial<Request>
{
	return {
		jwtPayload: undefined,
		twoFactorVerified: undefined,
		...overrides,
	}
}

describe('app/middleware/require-2fa', () =>
{
	let res: Partial<Response>
	let next: NextFunction

	beforeEach(() =>
	{
		vi.clearAllMocks()
		res = {}
		next = vi.fn()
	})

	it('should pass through when user does not have 2FA enabled', async () =>
	{
		// Init
		const req = _mockReq({
			jwtPayload: { sub: '42', type: 'access' } as any,
		})
		mockHasTotpEnabled.mockResolvedValue(false)

		// Action
		const middleware = require2FA()
		await middleware(req as Request, res as Response, next)

		// Assert
		expect(next).toHaveBeenCalled()
	})

	it('should pass through when no JWT context', async () =>
	{
		// Init
		const req = _mockReq()

		// Action
		const middleware = require2FA()
		await middleware(req as Request, res as Response, next)

		// Assert
		expect(next).toHaveBeenCalled()
		expect(mockHasTotpEnabled).not.toHaveBeenCalled()
	})

	it('should pass through when 2FA is enabled and verified', async () =>
	{
		// Init
		const req = _mockReq({
			jwtPayload: { sub: '42', type: 'access' } as any,
			twoFactorVerified: true,
		})
		mockHasTotpEnabled.mockResolvedValue(true)

		// Action
		const middleware = require2FA()
		await middleware(req as Request, res as Response, next)

		// Assert
		expect(next).toHaveBeenCalled()
	})

	it('should throw AuthenticationError when 2FA enabled but not verified', async () =>
	{
		// Init
		const req = _mockReq({
			jwtPayload: { sub: '42', type: 'access' } as any,
			twoFactorVerified: false,
		})
		mockHasTotpEnabled.mockResolvedValue(true)

		// Action + Assert
		const middleware = require2FA()
		await expect(middleware(req as Request, res as Response, next))
			.rejects.toThrow(AuthenticationError)
	})

	it('should throw when 2FA enabled and twoFactorVerified is undefined', async () =>
	{
		// Init
		const req = _mockReq({
			jwtPayload: { sub: '42', type: 'access' } as any,
		})
		mockHasTotpEnabled.mockResolvedValue(true)

		// Action + Assert
		const middleware = require2FA()
		await expect(middleware(req as Request, res as Response, next))
			.rejects.toThrow('Two-factor authentication required')
	})
})
