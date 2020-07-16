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

	// Return a message?
	const message = env('DEBUG_MODE') ? error.message : undefined

	// Respond
	respond(req, res).exception(message)
}
