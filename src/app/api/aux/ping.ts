import { Request, Response, NextFunction } from 'express'
import { respond } from '~/lib/util'

export async function ping(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	// Success
	respond(req, res, next).success('PONG')
}
