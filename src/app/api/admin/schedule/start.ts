import { Request, Response } from 'express'
import { respond, schedule } from '~/lib/util'

export async function start(req: Request, res: Response): Promise<void> {
	// Start schedule
	schedule.scheduler().start()

	// Success
	respond(req, res).success()
}
