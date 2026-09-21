import type { PrismaClient } from '../../src/generated/prisma/client'

const ROLES = [
	{ name: 'admin', description: 'Full system access' },
	{ name: 'user', description: 'Standard user access' },
]

const PERMISSIONS = [
	{ action: 'user:read', description: 'View user profiles' },
	{ action: 'user:write', description: 'Create and update users' },
	{ action: 'user:delete', description: 'Delete users' },
	{ action: 'content:read', description: 'View content' },
	{ action: 'content:write', description: 'Create and update content' },
	{ action: 'content:delete', description: 'Delete content' },
	{ action: 'admin:access', description: 'Access admin panel' },
]

const ROLE_PERMISSIONS: Record<string, string[]> = {
	admin: [
		'user:read', 'user:write', 'user:delete',
		'content:read', 'content:write', 'content:delete',
		'admin:access',
	],
	user: [
		'user:read',
		'content:read',
	],
}

export async function seedRoles(prisma: PrismaClient): Promise<void>
{
	// Seed permissions
	for(const permission of PERMISSIONS)
	{
		await prisma.permission.upsert({
			where: { action: permission.action },
			update: {},
			create: permission,
		})
	}

	console.log(`  Permissions: ${PERMISSIONS.length} seeded`)

	// Seed roles
	for(const role of ROLES)
	{
		await prisma.role.upsert({
			where: { name: role.name },
			update: {},
			create: role,
		})
	}

	console.log(`  Roles: ${ROLES.length} seeded`)

	// Assign permissions to roles
	for(const [roleName, actions] of Object.entries(ROLE_PERMISSIONS))
	{
		// Find role
		const role = await prisma.role.findUnique({ where: { name: roleName } })

		if( ! role) continue

		for(const action of actions)
		{
			// Find permission
			const permission = await prisma.permission.findUnique({ where: { action } })

			if( ! permission) continue

			// Upsert role-permission link
			await prisma.rolePermission.upsert({
				where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
				update: {},
				create: { roleId: role.id, permissionId: permission.id },
			})
		}
	}

	console.log('  Role permissions assigned')
}
