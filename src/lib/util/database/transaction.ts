import { PrismaClient } from '~/generated/prisma/client'
import { database } from './database'

/*
 * Transaction Result
 */
export interface TransactionResult<T>
{
	success: boolean
	data?: T
	error?: string
}

/*
 * Run a Prisma interactive transaction
 *
 * Wraps prisma.$transaction() with consistent error handling.
 * The callback receives a transaction client — use it instead
 * of the global client for all operations within the transaction.
 *
 * @param fn - Callback receiving the transaction client
 * @returns TransactionResult with success/data/error
 */
export async function transaction<T>(
	fn: (tx: PrismaClient) => Promise<T>
): Promise<TransactionResult<T>>
{
	try
	{
		// Execute transaction
		const data = await database.client().$transaction(async (tx) =>
		{
			return await fn(tx as unknown as PrismaClient)
		})

		return { success: true, data }
	}
	catch(e: unknown)
	{
		// Extract message
		const error = e instanceof Error ? e.message : String(e)

		return { success: false, error }
	}
}
