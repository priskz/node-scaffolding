import { PrismaClient } from '~/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '~/lib/util/env'
import { withSoftDeletes } from './extensions'

/*
 * Global Prisma Client Instance
 */
let instance: PrismaClient

/*
 * Connect Database
 */
async function connect(): Promise<boolean> {
	// Init adapter
	const adapter = new PrismaPg(env.DATABASE_URL)

	// Create base client
	const base = new PrismaClient({ adapter })

	// Apply extensions
	instance = withSoftDeletes(base)

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
