import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Hoisted mocks
 */
const { mockHasPermission, mockHasAnyPermission } = vi.hoisted(() => ({
	mockHasPermission: vi.fn(),
	mockHasAnyPermission: vi.fn(),
}))

vi.mock('~/lib/util/rbac', () => ({
	rbac: {
		hasPermission: mockHasPermission,
		hasAnyPermission: mockHasAnyPermission,
	},
}))

import { requirePermission, requireAnyPermission } from './require-permission'
import { ForbiddenError, AuthenticationError } from '~/lib/error'

describe('app/middleware/require-permission', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	describe('requirePermission', () =>
	{
		it('should call next when JWT user has the permission', async () =>
		{
			// Init
			const req = { jwtPayload: { sub: '42' } } as any
			const res = {} as any
			const next = vi.fn()

			mockHasPermission.mockResolvedValue(true)

			// Action
			const middleware = requirePermission('user:create')
			await middleware(req, res, next)

			// Assert
			expect(mockHasPermission).toHaveBeenCalledWith(42, 'user:create')
			expect(next).toHaveBeenCalled()
		})

		it('should throw ForbiddenError when JWT user lacks permission', async () =>
		{
			// Init
			const req = { jwtPayload: { sub: '42' } } as any
			const res = {} as any
			const next = vi.fn()

			mockHasPermission.mockResolvedValue(false)

			// Action + Assert
			const middleware = requirePermission('user:delete')
			await expect(middleware(req, res, next)).rejects.toThrow(ForbiddenError)
			expect(next).not.toHaveBeenCalled()
		})

		it('should throw AuthenticationError when no auth context exists', async () =>
		{
			// Init
			const req = {} as any
			const res = {} as any
			const next = vi.fn()

			// Action + Assert
			const middleware = requirePermission('user:create')
			await expect(middleware(req, res, next)).rejects.toThrow(AuthenticationError)
		})

		it('should pass through when API key has the permission', async () =>
		{
			// Init
			const req = { apiKeyPermissions: ['user:create', 'user:read'] } as any
			const res = {} as any
			const next = vi.fn()

			// Action
			const middleware = requirePermission('user:create')
			await middleware(req, res, next)

			// Assert
			expect(next).toHaveBeenCalled()
			expect(mockHasPermission).not.toHaveBeenCalled()
		})

		it('should pass through when API key has wildcard permission', async () =>
		{
			// Init
			const req = { apiKeyPermissions: ['*'] } as any
			const res = {} as any
			const next = vi.fn()

			// Action
			const middleware = requirePermission('anything:here')
			await middleware(req, res, next)

			// Assert
			expect(next).toHaveBeenCalled()
		})

		it('should throw ForbiddenError when API key lacks the permission', async () =>
		{
			// Init
			const req = { apiKeyPermissions: ['content:read'] } as any
			const res = {} as any
			const next = vi.fn()

			// Action + Assert
			const middleware = requirePermission('user:delete')
			await expect(middleware(req, res, next)).rejects.toThrow(ForbiddenError)
		})
	})

	describe('requireAnyPermission', () =>
	{
		it('should call next when JWT user has at least one permission', async () =>
		{
			// Init
			const req = { jwtPayload: { sub: '42' } } as any
			const res = {} as any
			const next = vi.fn()

			mockHasAnyPermission.mockResolvedValue(true)

			// Action
			const middleware = requireAnyPermission(['user:create', 'user:delete'])
			await middleware(req, res, next)

			// Assert
			expect(next).toHaveBeenCalled()
		})

		it('should throw ForbiddenError when JWT user has none of the permissions', async () =>
		{
			// Init
			const req = { jwtPayload: { sub: '42' } } as any
			const res = {} as any
			const next = vi.fn()

			mockHasAnyPermission.mockResolvedValue(false)

			// Action + Assert
			const middleware = requireAnyPermission(['user:create', 'user:delete'])
			await expect(middleware(req, res, next)).rejects.toThrow(ForbiddenError)
		})

		it('should pass through when API key has any of the permissions', async () =>
		{
			// Init
			const req = { apiKeyPermissions: ['content:read', 'content:write'] } as any
			const res = {} as any
			const next = vi.fn()

			// Action
			const middleware = requireAnyPermission(['content:write', 'content:delete'])
			await middleware(req, res, next)

			// Assert
			expect(next).toHaveBeenCalled()
		})
	})
})
