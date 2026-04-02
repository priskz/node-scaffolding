import { PrismaClient } from '~/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/*
 * Global Prisma Client Instance
 */
let instance: PrismaClient

/*
 * Connect Database
 */
async function connect(): Promise<boolean> {
	// Init adapter
	const connectionString = process.env.DATABASE_URL || ''
	const adapter = new PrismaPg(connectionString)

	// Create client
	instance = new PrismaClient({ adapter })

	// Connect
	await instance.$connect()

	// Connected
	return true
}

/*
 * Disconnect Database
 */
async function disconnect(): Promise<boolean> {
	// No instance?
	if( ! instance) return false

	// Disconnect
	await instance.$disconnect()

	// Disconnected
	return true
}

/*
 * Retrieve Prisma Client
 */
function client(): PrismaClient {
	return instance
}

/*
 * Export Util
 */
export const database = {
	client,
	connect,
	disconnect
}
