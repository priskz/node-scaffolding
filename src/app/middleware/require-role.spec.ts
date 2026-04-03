import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Hoisted mocks
 */
const { mockHasRole } = vi.hoisted(() => ({
	mockHasRole: vi.fn(),
}))

vi.mock('~/lib/util/rbac', () => ({
	rbac: {
		hasRole: mockHasRole,
	},
}))

import { requireRole } from './require-role'
import { ForbiddenError, AuthenticationError } from '~/lib/error'

describe('app/middleware/require-role', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should call next when user has the role', async () =>
	{
		// Init
		const req = { jwtPayload: { sub: '42' } } as any
		const res = {} as any
		const next = vi.fn()

		mockHasRole.mockResolvedValue(true)

		// Action
		const middleware = requireRole('admin')
		await middleware(req, res, next)

		// Assert
		expect(mockHasRole).toHaveBeenCalledWith(42, 'admin')
		expect(next).toHaveBeenCalled()
	})

	it('should throw ForbiddenError when user lacks the role', async () =>
	{
		// Init
		const req = { jwtPayload: { sub: '42' } } as any
		const res = {} as any
		const next = vi.fn()

		mockHasRole.mockResolvedValue(false)

		// Action + Assert
		const middleware = requireRole('admin')
		await expect(middleware(req, res, next)).rejects.toThrow(ForbiddenError)
		expect(next).not.toHaveBeenCalled()
	})

	it('should throw AuthenticationError when no JWT payload', async () =>
	{
		// Init
		const req = {} as any
		const res = {} as any
		const next = vi.fn()

		// Action + Assert
		const middleware = requireRole('admin')
		await expect(middleware(req, res, next)).rejects.toThrow(AuthenticationError)
	})
})
