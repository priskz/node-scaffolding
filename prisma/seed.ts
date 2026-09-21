import { PrismaClient } from '../src/generated/prisma/client'
import { seedRoles } from './seeders/role-seeder'
import { seedUsers } from './seeders/user-seeder'

const prisma = new PrismaClient()

async function main(): Promise<void>
{
	console.log('Seeding database...')

	// Seed roles and permissions
	await seedRoles(prisma)

	// Seed users
	await seedUsers(prisma)

	console.log('Seeding complete.')
}

main()
	.catch((error) =>
	{
		console.error('Seed failed:', error)
		process.exit(1)
	})
	.finally(async () =>
	{
		await prisma.$disconnect()
	})
