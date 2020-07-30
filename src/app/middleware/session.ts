import { Request, Response, NextFunction } from 'express'
import { config } from '~/config'
import { respond, time } from '~/lib/util'
import { SessionRoot } from '~/app/service'
import { Session as SessionModel } from '~/app/domain'

/*
 * Attempt to extract incoming ip address
 */
export function getIpAddress(req: Request): string | undefined {
	// Forwarded address
	const forwarded = req.headers['x-forwarded-for']

	// Direct address
	const direct = req.ip || (req.connection && req.connection.remoteAddress)

	// First, try forwarded-for header IP
	if (forwarded && typeof forwarded === 'string') return forwarded

	// Next, try the direct connection IP
	if (direct) return direct
}

/*
 * Attempt to extract user agent information
 */
export function getAgent(req: Request): string {
	return req.headers['user-agent'] || 'No Agent Found'
}

/*
 * Check if session is expired
 */
export function isExpired(model: SessionModel): boolean {
	// Parse time object
	const expiresAt = time.parse(model.expiresAt)

	// Expiration defined?
	if (!expiresAt) return false

	// Compare time and return bool
	return model && time.now() > expiresAt
}

/*
 * Session Middleware
 */
export async function session(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	// Signed session cookie?
	const sessionId = req.signedCookies[config.session.cookie]

	// Invalid or tampered cookie
	if (sessionId === false) {
		// Clear cookie
		res.clearCookie(config.session.cookie)

		// Unauthorized response
		respond(req, res).error('invalid cookie', 401)

		// Terminate
		return
	}

	// Init
	const service = new SessionRoot()

	// Init
	let session

	// Is Session ID provided?
	if (sessionId) {
		// Find session
		session = await service.getOneById(sessionId)

		// Found?
		if (!session) {
			// Clear cookie
			res.clearCookie(config.session.cookie)

			// Unauthorized response
			respond(req, res).error('not found', 404)

			// Terminate
			return
		}

		// Not expired?
		if (!isExpired(session)) {
			// Update activity
			await service.touch(sessionId)
		}
	}

	// No session? Safe to create a new one!
	if (!session) {
		// Create new session
		session = (await service.generate(
			getAgent(req),
			getIpAddress(req)
		)) as SessionModel

		// Add session cookie to response
		res.cookie(config.session.cookie, session.id, {
			expires: session.expiresAt,
			sameSite: 'strict',
			signed: true
		})
	}

	// Add session to request
	req.setSession(session)

	// Continue request
	next()
}
