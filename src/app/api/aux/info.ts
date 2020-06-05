import { Request, Response, NextFunction } from 'express'
import { respond } from '~/lib/util'

export async function info(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	// Success
	respond(req, res, next).success({ name: 'New App' })
}
