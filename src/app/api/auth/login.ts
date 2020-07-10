import { Request, Response } from 'express'
import { Validator } from 'node-input-validator'
import { respond } from '~/lib/util'
import { config } from '~/config'
import { AuthRoot } from '~/app/service'

export async function login(req: Request, res: Response): Promise<void> {
	// Session have a user?
	if (req.getUser()) {
		// Error response
		respond(req, res).error()
		return
	}

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
		respond(req, res).error(null, 401)
		return
	}

	// Init service
	const service = new AuthRoot()

	// Attempt login
	const session = await service.login(
		req.getSession(),
		req.body.email,
		req.body.pass
	)

	// Failed login?
	if (!session) {
		// Error response
		respond(req, res).error(null, 401)
		return
	}

	// Update req session
	req.setSession(session)

	// Update response cookie
	await res.cookie(config.session.cookie, session.id, {
		expires: session.expiresAt,
		sameSite: 'strict',
		signed: true
	})

	// Success
	respond(req, res).success()
}
