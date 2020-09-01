import { Request, Response } from 'express'
import { respond, schedule } from '~/lib/util'

export async function stop(req: Request, res: Response): Promise<void> {
	// Stop schedule
	schedule.scheduler().stop()

	// Success
	respond(req, res).success()
}
