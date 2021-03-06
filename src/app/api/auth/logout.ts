import { Request, Response } from 'express'
import { respond } from '~/lib/util'
import { config } from '~/config'
import { AuthRoot } from '~/app/service'

export async function logout(req: Request, res: Response): Promise<void> {
	// Get session from request
	const session = req.getSession()

	// No session?
	if (!session || !session.userId) {
		// Error response
		respond(req, res).error()
		return
	}

	// Init service
	const service = new AuthRoot()

	// Attempt logout
	await service.logout(session)

	// Clear cookie
	res.clearCookie(config.session.cookie)

	// Success
	respond(req, res).success()
}
