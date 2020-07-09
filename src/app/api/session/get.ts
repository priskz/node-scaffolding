import { Request, Response } from 'express'
import { respond } from '~/lib/util'
import { config } from '~/config'

export async function get(req: Request, res: Response): Promise<void> {
	// Success!
	respond(req, res).success()
}
