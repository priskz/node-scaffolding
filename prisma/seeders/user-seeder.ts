import { hash } from 'bcrypt'
import type { PrismaClient } from '../../src/generated/prisma/client'

const SALT_ROUNDS = 10

const USERS = [
	{
		email: 'admin@example.com',
		password: 'password',
		firstName: 'Admin',
		lastName: 'User',
		roles: ['admin'],
	},
	{
		email: 'user@example.com',
		password: 'password',
		firstName: 'Standard',
		lastName: 'User',
		roles: ['user'],
	},
]

export async function seedUsers(prisma: PrismaClient): Promise<void>
{
	for(const userData of USERS)
	{
		// Hash password
		const hashed = await hash(userData.password, SALT_ROUNDS)

		// Upsert user
		const user = await prisma.user.upsert({
			where: { email: userData.email },
			update: {},
			create: {
				email: userData.email,
				password: hashed,
				firstName: userData.firstName,
				lastName: userData.lastName,
			},
		})

		// Assign roles
		for(const roleName of userData.roles)
		{
			const role = await prisma.role.findUnique({ where: { name: roleName } })

			if( ! role) continue

			await prisma.userRole.upsert({
				where: { userId_roleId: { userId: user.id, roleId: role.id } },
				update: {},
				create: { userId: user.id, roleId: role.id },
			})
		}
	}

	console.log(`  Users: ${USERS.length} seeded with roles`)
}
