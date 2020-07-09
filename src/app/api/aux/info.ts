import { Request, Response } from 'express'
import { respond } from '~/lib/util'

export async function info(req: Request, res: Response): Promise<void> {
	// Success
	respond(req, res).success({ name: 'New App' })
}
