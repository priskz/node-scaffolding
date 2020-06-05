import { NextFunction, Request, Response } from 'express'
import { env, log, respond } from '~/lib/util'

/*
 * Exception Handler
 */
export async function exception(
	error: Error,
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	// Log error
	log.error(`Exception: ${error.message}`)

	// Respond with exception if in debug mode
	if (env('DEBUG_MODE')) {
		respond(req, res, next).exception(`Exception: ${error.message}`)
	}

	// Continue
	next()
}
