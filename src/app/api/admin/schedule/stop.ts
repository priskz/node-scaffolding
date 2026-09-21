import { Request, Response } from 'express'
import { respond, job } from '~/lib/util'

export async function stop(req: Request, res: Response): Promise<void>
{
	// Stop job service
	await job.close()

	// Success
	respond(req, res).success()
}
