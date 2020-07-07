import { Request, Response, NextFunction } from 'express'
import { Validator } from 'node-input-validator'
import { respond } from '~/lib/util'
import { AuthRoot } from '~/app/service'

export async function login(
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
		respond(req, res, next).error(null, 401)
		return
	}

	const service = new AuthRoot()

	// Attempt login
	const user = await service.login(req.body.email, req.body.pass)

	// Failed login?
	if (!user) {
		// Error response
		respond(req, res, next).error(null, 401)
		return
	}

	// Success
	respond(req, res, next).success()
}
