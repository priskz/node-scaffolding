import { Request, Response } from 'express'
import { respond, job } from '~/lib/util'

export async function stack(req: Request, res: Response): Promise<void>
{
	// Retrieve job list (same as job list — backward compatibility)
	respond(req, res).success(job.list())
}
