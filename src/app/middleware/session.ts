import moment from 'moment'
import { Request, Response, NextFunction } from 'express'
import { config } from '~/config'
import { respond } from '~/lib/util'
import { SessionRoot } from '~/app/service'

/**
 * Attempts to extract the user's IP address from the incoming Express request
 */
export function getUserIP(req: Request): string {
	// Forwarded address
	const forwarded = req.headers['x-forwarded-for']

	// Direct address
	const direct = req.ip || (req.connection && req.connection.remoteAddress)

	// First, try forwarded-for header IP
	if (forwarded && typeof forwarded === 'string') return forwarded

	// Next, try the direct connection IP
	if (direct) return direct

	return 'No IP Found'
}

/**
 * Attempts to extract the user's User Agent data from the incoming Express request
 */
export function getBrowserAgent(req: Request): string {
	return req.headers['user-agent'] || 'No Agent Found'
}

export async function session(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	const sessionId =
		req.signedCookies && req.signedCookies[config.session.cookie]

	// Tampered cookie?
	if (sessionId === false) {
		// Clear cookie
		res.clearCookie(config.session.cookie)

		// Error
		respond(req, res, next).error('invalid cookie', 401)
		return
	}

	const service = new SessionRoot()

	// Init
	let session

	// Is Session ID provided?
	if (sessionId && typeof sessionId === 'string') {
		// Retrieve existing
		session = await service.getOneById(sessionId)

		// Found, but expired?
		if (session && moment() > moment(session.expiresAt)) {
			// Create new
			session = await service.generate(getBrowserAgent(req), getUserIP(req))
		} else {
			// Update activity
			await service.updateActiveAt(sessionId)
		}
	} else {
		// Create new
		session = await service.generate(getBrowserAgent(req), getUserIP(req))
	}

	// Handle invalid / missing sessions
	if (!session) {
		// Clear cookie
		res.clearCookie(config.session.cookie)

		// Error
		respond(req, res, next).error('invalid or missing session', 401)
		return
	}

	// Update the cookie
	await res.cookie(config.session.cookie, session.id, {
		expires: session.expiresAt,
		sameSite: 'strict',
		signed: true
	})

	// Add session to request
	req.setSession(session)

	// Move on
	next()
}
