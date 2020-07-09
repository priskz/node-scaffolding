import { Request, Response, NextFunction } from 'express'
import { respond } from '~/lib/util'
import { config } from '~/config'

export async function get(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	// Handle response
	if (req.getSession()) {
		// Success
		respond(req, res, next).success()
	} else {
		// Removie cookie
		res.clearCookie(config.session.cookie)
		// Error
		respond(req, res, next).error(null, 400)
	}
}
