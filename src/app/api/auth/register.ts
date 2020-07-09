import { Request, Response } from 'express'
import { Validator } from 'node-input-validator'
import { respond } from '~/lib/util'
import { AuthRoot } from '~/app/service'

export async function register(req: Request, res: Response): Promise<void> {
	// Prepare validation
	const input = new Validator(req.body, {
		email: 'required|email',
		pass: 'required|minLength:6'
	})

	// Validate
	const valid = await input.check()

	// Invalid?
	if (!valid) {
		// Error response
		respond(req, res).error(input.errors, 400)
		return
	}

	// Init service
	const service = new AuthRoot()

	// Attempt
	const user = await service.register(req.body)

	// Failed?
	if (!user) {
		// Error response
		respond(req, res).error(null, 400)
		return
	}

	// Success
	respond(req, res).success()
}
