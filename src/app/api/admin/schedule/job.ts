import { Request, Response } from 'express'
import { respond, schedule } from '~/lib/util'

export async function job(req: Request, res: Response): Promise<void> {
	// Retrieve scheduler job
	respond(req, res).success(schedule.scheduler().getJob())
}
