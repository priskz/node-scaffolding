import { Request, Response, NextFunction } from 'express'
import { rbac } from '~/lib/util/rbac'
import { AuthenticationError, ForbiddenError } from '~/lib/error'

/*
 * Require Role Middleware Factory
 *
 * Returns middleware that checks if the authenticated user
 * has the specified role. Requires jwtAuth to have run first.
 * API key auth does not carry role context — role guards
 * are for user-based auth only.
 *
 * @param roleName Role name — e.g. 'admin'
 * @returns Express middleware
 */
export function requireRole(roleName: string)
{
	return async function(req: Request, _res: Response, next: NextFunction): Promise<void>
	{
		// JWT payload required
		if( ! req.jwtPayload?.sub)
		{
			throw new AuthenticationError('Authentication required')
		}

		// Get user ID
		const userId = parseInt(req.jwtPayload.sub, 10)

		// Check role
		const allowed = await rbac.hasRole(userId, roleName)

		// Denied?
		if( ! allowed)
		{
			throw new ForbiddenError(`Missing role: ${roleName}`)
		}

		// Continue
		next()
	}
}
