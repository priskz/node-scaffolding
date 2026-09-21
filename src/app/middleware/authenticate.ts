import { Request, Response, NextFunction } from 'express'
import { jwt } from '~/lib/util'
import { apiKey } from '~/lib/util/api-key'
import { AuthenticationError } from '~/lib/error'

/*
 * Unified Authentication Middleware
 *
 * Checks for authentication via JWT (Authorization: Bearer) or
 * API key (X-API-Key header). First valid strategy wins.
 * Use this on routes that accept either auth method.
 *
 * Attaches:
 * - req.jwtPayload (if JWT)
 * - req.apiKeyPermissions (if API key)
 *
 * Throws AuthenticationError if neither strategy succeeds.
 */
export async function authenticate(
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void>
{
	// Try JWT first — Authorization: Bearer header
	const authHeader = req.headers.authorization

	if(authHeader && authHeader.startsWith('Bearer '))
	{
		// Extract token
		const token = authHeader.slice(7)

		// Verify
		const payload = await jwt.verifyToken(token)

		// Valid access token?
		if(payload && payload.type === 'access')
		{
			req.jwtPayload = payload
			next()
			return
		}
	}

	// Try API key — X-API-Key header
	const apiKeyHeader = req.headers['x-api-key']

	if(apiKeyHeader && typeof apiKeyHeader === 'string')
	{
		// Validate
		const result = await apiKey.validateApiKey(apiKeyHeader)

		// Valid?
		if(result)
		{
			req.apiKeyPermissions = result.permissions
			next()
			return
		}
	}

	// Neither strategy succeeded
	throw new AuthenticationError('Authentication required — provide Bearer token or X-API-Key')
}
