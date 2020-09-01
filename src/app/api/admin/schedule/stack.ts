import { Request, Response } from 'express'
import { respond, schedule } from '~/lib/util'

export async function stack(req: Request, res: Response): Promise<void> {
	// Retrieve scheduler stack
	respond(req, res).success(schedule.scheduler().getStack())
}
