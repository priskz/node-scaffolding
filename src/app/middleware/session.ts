import { Request, Response, NextFunction } from 'express'
import { config } from '~/config'
import { respond } from '~/lib/util'
import { SessionRoot } from '~/app/service'

/**
 * Attempts to extract the user's IP address from the incoming Express request
 */
export function _getUserIP(req: Request): string {
	const directAddr = req.connection && req.connection.remoteAddress
	const forwardedAddr = req.headers['x-forwarded-for']

	// First, try the direct connection IP
	if (directAddr) return directAddr

	// Next, dry forwarded-for header IP
	if (forwardedAddr && typeof forwardedAddr === 'string') return forwardedAddr

	return 'No IP Found'
}

/**
 * Attempts to extract the user's User Agent data from the incoming Express request
 */
export function _getUserAgent(req: Request): string {
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
		res.clearCookie(config.session.cookie)

		// Error
		respond(req, res, next).error('invalid cookie', 401)
		return
	}

	let session

	// Is Session ID provided?
	if (sessionId && typeof sessionId === 'string') {
		// TODO:
		// session = await SessionRoot.getSessionById(sessionId)
	} else {
		// TODO:
		// session = await SessionRoot.createSession(
		// 	_getUserAgent(req),
		// 	_getUserIP(req)
		// )
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
	// TODO:
	// await res.cookie(config.session.cookie, session.id, {
	// 	expires: session.expiresAt,
	// 	sameSite: 'strict',
	// 	signed: true
	// })

	// Add session to request
	req.setSession(session)

	// Move on
	next()
}
