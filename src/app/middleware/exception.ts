import { NextFunction, Request, Response } from 'express'
import { AppError } from '~/lib/error'
import { env, log } from '~/lib/util'

/*
 * Exception Handler
 */
export async function exception(
	error: Error,
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void>
{
	// AppError? Use structured response
	if(error instanceof AppError)
	{
		// Log non-500 errors at warn level
		if(error.statusCode < 500)
		{
			log.warn({ code: error.code, statusCode: error.statusCode }, error.message)
		}
		else
		{
			log.error({ code: error.code, statusCode: error.statusCode }, error.message)
		}

		// Structured error response
		res.status(error.statusCode).json(error.toJSON())
		return
	}

	// Unstructured error — log and return generic 500
	log.error({ error: error.message, stack: error.stack }, 'Unhandled exception')

	// Return detail in debug mode only
	const message = env.DEBUG_MODE ? error.message : undefined

	// Respond
	res.status(500).json(
		message
			? { code: 'INTERNAL_ERROR', message }
			: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
	)
}
