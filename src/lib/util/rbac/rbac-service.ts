import { database } from '~/lib/util/database'
import { remember } from '~/lib/util/cache'
import { cacheClient } from '~/lib/util/cache/cache-client'
import type { UserPermissions } from './types'

/*
 * Cache key prefix
 */
const CACHE_PREFIX = 'rbac:user:'

/*
 * Cache TTL — 5 minutes
 */
const CACHE_TTL = 300

/*
 * Get User Permissions
 *
 * Returns the user's roles and flattened permissions.
 * Cached in Valkey via remember() pattern.
 */
async function getUserPermissions(userId: number): Promise<UserPermissions>
{
	return remember<UserPermissions>(
		`${CACHE_PREFIX}${userId}`,
		CACHE_TTL,
		() => _loadUserPermissions(userId)
	)
}

/*
 * Load User Permissions from DB
 *
 * Queries the user's roles and their associated permissions.
 * Flattens into a unique set of permission action strings.
 */
async function _loadUserPermissions(userId: number): Promise<UserPermissions>
{
	// Get prisma client
	const prisma = database.client()

	// Load user roles with permissions
	const userRoles = await prisma.userRole.findMany({
		where: { userId },
		include: {
			role: {
				include: {
					permissions: {
						include: {
							permission: true,
						},
					},
				},
			},
		},
	})

	// Extract role names
	const roles = userRoles.map(ur => ur.role.name)

	// Flatten permissions — deduplicate
	const permissionSet = new Set<string>()

	for(const userRole of userRoles)
	{
		for(const rp of userRole.role.permissions)
		{
			permissionSet.add(rp.permission.action)
		}
	}

	const permissions = Array.from(permissionSet)

	return { userId, roles, permissions }
}

/*
 * Has Permission
 *
 * Checks if a user has a specific permission action string.
 */
async function hasPermission(userId: number, action: string): Promise<boolean>
{
	// Load permissions
	const userPerms = await getUserPermissions(userId)

	// Check
	return userPerms.permissions.includes(action)
}

/*
 * Has Role
 *
 * Checks if a user has a specific role by name.
 */
async function hasRole(userId: number, roleName: string): Promise<boolean>
{
	// Load permissions
	const userPerms = await getUserPermissions(userId)

	// Check
	return userPerms.roles.includes(roleName)
}

/*
 * Has Any Permission
 *
 * Checks if a user has at least one of the given permissions.
 */
async function hasAnyPermission(userId: number, actions: string[]): Promise<boolean>
{
	// Load permissions
	const userPerms = await getUserPermissions(userId)

	// Check
	return actions.some(action => userPerms.permissions.includes(action))
}

/*
 * Has All Permissions
 *
 * Checks if a user has all of the given permissions.
 */
async function hasAllPermissions(userId: number, actions: string[]): Promise<boolean>
{
	// Load permissions
	const userPerms = await getUserPermissions(userId)

	// Check
	return actions.every(action => userPerms.permissions.includes(action))
}

/*
 * Clear Permission Cache
 *
 * Call this when a user's roles or permissions change.
 */
async function clearPermissionCache(userId: number): Promise<void>
{
	// Get cache client
	const client = cacheClient.instance()

	// Delete cached permissions
	await client.del(`${CACHE_PREFIX}${userId}`)
}

/*
 * Export Service
 */
export const rbac = {
	getUserPermissions,
	hasPermission,
	hasRole,
	hasAnyPermission,
	hasAllPermissions,
	clearPermissionCache,
}
