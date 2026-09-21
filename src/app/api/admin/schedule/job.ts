import { Request, Response } from 'express'
import { respond, job } from '~/lib/util'

export async function list(req: Request, res: Response): Promise<void>
{
	// Retrieve job list
	respond(req, res).success(job.list())
}
