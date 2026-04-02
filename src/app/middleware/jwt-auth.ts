import { Request, Response, NextFunction } from 'express'
import { jwt } from '~/lib/util'
import { AuthenticationError } from '~/lib/error'

/*
 * JWT Authentication Middleware
 *
 * Validates the Authorization: Bearer header.
 * Attaches the decoded payload to req.jwtPayload.
 * Only accepts access tokens — refresh tokens are rejected.
 */
export async function jwtAuth(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void>
{
	// Extract header
	const header = req.headers.authorization

	// Missing?
	if( ! header || ! header.startsWith('Bearer '))
	{
		throw new AuthenticationError('Missing or invalid Authorization header')
	}

	// Extract token
	const token = header.slice(7)

	// Verify
	const payload = await jwt.verifyToken(token)

	// Invalid?
	if( ! payload)
	{
		throw new AuthenticationError('Invalid or expired token')
	}

	// Refresh token used as access token?
	if(payload.type !== 'access')
	{
		throw new AuthenticationError('Invalid token type')
	}

	// Attach payload to request
	req.jwtPayload = payload

	// Continue
	next()
}
