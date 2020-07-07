import { Request, Response, NextFunction } from 'express'
import { Validator } from 'node-input-validator'
import { respond } from '~/lib/util'
import { AuthRoot } from '~/app/service'

export async function register(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	// Prepare validation
	const input = new Validator(req.body, {
		email: 'required|email',
		pass: 'required'
	})

	// Validate
	const valid = await input.check()

	// Invalid?
	if (!valid) {
		// Error response
		respond(req, res, next).error(null, 400)
		return
	}

	const service = new AuthRoot()

	// Attempt
	const user = await service.register(req.body)

	// Failed?
	if (!user) {
		// Error response
		respond(req, res, next).error(null, 400)
		return
	}

	// Success
	respond(req, res, next).success()
}
