import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Hoisted mocks
 */
const { mockFindMany, mockRemember, mockDel } = vi.hoisted(() => ({
	mockFindMany: vi.fn(),
	mockRemember: vi.fn(),
	mockDel: vi.fn(),
}))

vi.mock('~/lib/util/database', () => ({
	database: {
		client: () => ({
			userRole: {
				findMany: mockFindMany,
			},
		}),
	},
}))

vi.mock('~/lib/util/cache', () => ({
	remember: mockRemember,
}))

vi.mock('~/lib/util/cache/cache-client', () => ({
	cacheClient: {
		instance: () => ({
			del: mockDel,
		}),
	},
}))

import { rbac } from './rbac-service'

describe('lib/util/rbac/rbac-service', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	describe('getUserPermissions', () =>
	{
		it('should call remember with the correct cache key and TTL', async () =>
		{
			// Init
			mockRemember.mockImplementation(async (_key: string, _ttl: number, factory: () => Promise<unknown>) =>
			{
				return factory()
			})

			mockFindMany.mockResolvedValue([
				{
					role: {
						name: 'admin',
						permissions: [
							{ permission: { action: 'user:create' } },
							{ permission: { action: 'user:delete' } },
						],
					},
				},
			])

			// Action
			const result = await rbac.getUserPermissions(42)

			// Assert
			expect(mockRemember).toHaveBeenCalledWith(
				'rbac:user:42',
				300,
				expect.any(Function),
			)
			expect(result).toEqual({
				userId: 42,
				roles: ['admin'],
				permissions: ['user:create', 'user:delete'],
			})
		})

		it('should deduplicate permissions across multiple roles', async () =>
		{
			// Init
			mockRemember.mockImplementation(async (_key: string, _ttl: number, factory: () => Promise<unknown>) =>
			{
				return factory()
			})

			mockFindMany.mockResolvedValue([
				{
					role: {
						name: 'editor',
						permissions: [
							{ permission: { action: 'content:read' } },
							{ permission: { action: 'content:write' } },
						],
					},
				},
				{
					role: {
						name: 'moderator',
						permissions: [
							{ permission: { action: 'content:read' } },
							{ permission: { action: 'content:delete' } },
						],
					},
				},
			])

			// Action
			const result = await rbac.getUserPermissions(99)

			// Assert
			expect(result.roles).toEqual(['editor', 'moderator'])
			expect(result.permissions).toHaveLength(3)
			expect(result.permissions).toContain('content:read')
			expect(result.permissions).toContain('content:write')
			expect(result.permissions).toContain('content:delete')
		})

		it('should return empty arrays when user has no roles', async () =>
		{
			// Init
			mockRemember.mockImplementation(async (_key: string, _ttl: number, factory: () => Promise<unknown>) =>
			{
				return factory()
			})

			mockFindMany.mockResolvedValue([])

			// Action
			const result = await rbac.getUserPermissions(1)

			// Assert
			expect(result).toEqual({
				userId: 1,
				roles: [],
				permissions: [],
			})
		})
	})

	describe('hasPermission', () =>
	{
		it('should return true when user has the permission', async () =>
		{
			// Init
			mockRemember.mockResolvedValue({
				userId: 42,
				roles: ['admin'],
				permissions: ['user:create', 'user:delete'],
			})

			// Action
			const result = await rbac.hasPermission(42, 'user:create')

			// Assert
			expect(result).toBe(true)
		})

		it('should return false when user lacks the permission', async () =>
		{
			// Init
			mockRemember.mockResolvedValue({
				userId: 42,
				roles: ['viewer'],
				permissions: ['content:read'],
			})

			// Action
			const result = await rbac.hasPermission(42, 'user:delete')

			// Assert
			expect(result).toBe(false)
		})
	})

	describe('hasRole', () =>
	{
		it('should return true when user has the role', async () =>
		{
			// Init
			mockRemember.mockResolvedValue({
				userId: 42,
				roles: ['admin', 'editor'],
				permissions: [],
			})

			// Action
			const result = await rbac.hasRole(42, 'admin')

			// Assert
			expect(result).toBe(true)
		})

		it('should return false when user lacks the role', async () =>
		{
			// Init
			mockRemember.mockResolvedValue({
				userId: 42,
				roles: ['viewer'],
				permissions: [],
			})

			// Action
			const result = await rbac.hasRole(42, 'admin')

			// Assert
			expect(result).toBe(false)
		})
	})

	describe('hasAnyPermission', () =>
	{
		it('should return true when user has at least one permission', async () =>
		{
			// Init
			mockRemember.mockResolvedValue({
				userId: 42,
				roles: ['editor'],
				permissions: ['content:read', 'content:write'],
			})

			// Action
			const result = await rbac.hasAnyPermission(42, ['content:delete', 'content:write'])

			// Assert
			expect(result).toBe(true)
		})

		it('should return false when user has none of the permissions', async () =>
		{
			// Init
			mockRemember.mockResolvedValue({
				userId: 42,
				roles: ['viewer'],
				permissions: ['content:read'],
			})

			// Action
			const result = await rbac.hasAnyPermission(42, ['content:write', 'content:delete'])

			// Assert
			expect(result).toBe(false)
		})
	})

	describe('hasAllPermissions', () =>
	{
		it('should return true when user has all permissions', async () =>
		{
			// Init
			mockRemember.mockResolvedValue({
				userId: 42,
				roles: ['admin'],
				permissions: ['user:create', 'user:read', 'user:delete'],
			})

			// Action
			const result = await rbac.hasAllPermissions(42, ['user:create', 'user:delete'])

			// Assert
			expect(result).toBe(true)
		})

		it('should return false when user is missing one permission', async () =>
		{
			// Init
			mockRemember.mockResolvedValue({
				userId: 42,
				roles: ['editor'],
				permissions: ['user:create', 'user:read'],
			})

			// Action
			const result = await rbac.hasAllPermissions(42, ['user:create', 'user:delete'])

			// Assert
			expect(result).toBe(false)
		})
	})

	describe('clearPermissionCache', () =>
	{
		it('should delete the cache key for the user', async () =>
		{
			// Action
			await rbac.clearPermissionCache(42)

			// Assert
			expect(mockDel).toHaveBeenCalledWith('rbac:user:42')
		})
	})
})
