import { Request, Response } from 'express'
import { database } from '~/lib/util'

/*
 * Health Check
 *
 * Returns system health status. Bypasses auth middleware.
 */
export async function health(req: Request, res: Response): Promise<void>
{
	// Init
	const status: HealthStatus = {
		status: 'ok',
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
		memory: {
			rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
			heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
			heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
		},
		database: false
	}

	// Check database
	try
	{
		const client = database.client()

		if(client)
		{
			await client.$queryRawUnsafe('SELECT 1')
			status.database = true
		}
	}
	catch
	{
		status.status = 'degraded'
		status.database = false
	}

	// Response code
	const code = status.status === 'ok' ? 200 : 503

	// Respond
	res.status(code).json(status)
}

interface HealthStatus
{
	status: 'ok' | 'degraded'
	uptime: number
	timestamp: string
	memory: {
		rss: number
		heapUsed: number
		heapTotal: number
	}
	database: boolean
}
