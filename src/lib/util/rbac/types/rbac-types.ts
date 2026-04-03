/*
 * RBAC Types
 */

export interface RoleRecord
{
	id: string
	name: string
	description: string | null
}

export interface PermissionRecord
{
	id: string
	action: string
	description: string | null
}

export interface UserPermissions
{
	userId: number
	roles: string[]
	permissions: string[]
}
