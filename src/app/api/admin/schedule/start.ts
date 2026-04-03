import { Request, Response } from 'express'
import { respond, job } from '~/lib/util'

export async function start(req: Request, res: Response): Promise<void>
{
	// Start job service
	await job.start()

	// Success
	respond(req, res).success()
}
