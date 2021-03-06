import { Request, Response } from 'express'
import { respond } from '~/lib/util'

export async function ping(req: Request, res: Response): Promise<void> {
	// Success
	respond(req, res).success('PONG')
}
