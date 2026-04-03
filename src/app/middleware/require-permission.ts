import { Request, Response, NextFunction } from 'express'
import { rbac } from '~/lib/util/rbac'
import { AuthenticationError, ForbiddenError } from '~/lib/error'

/*
 * Require Permission Middleware Factory
 *
 * Returns middleware that checks if the authenticated user
 * has the specified permission. Requires jwtAuth or apiKeyAuth
 * to have run first (req.jwtPayload or req.apiKeyPermissions).
 *
 * @param action Permission action string — e.g. 'auction:create'
 * @returns Express middleware
 */
export function requirePermission(action: string)
{
	return async function(req: Request, _res: Response, next: NextFunction): Promise<void>
	{
		// API key auth — check scoped permissions directly
		if(req.apiKeyPermissions)
		{
			// Wildcard?
			if(req.apiKeyPermissions.includes('*'))
			{
				next()
				return
			}

			// Has permission?
			if( ! req.apiKeyPermissions.includes(action))
			{
				throw new ForbiddenError(`Missing permission: ${action}`)
			}

			next()
			return
		}

		// JWT auth — check user permissions via RBAC service
		if( ! req.jwtPayload?.sub)
		{
			throw new AuthenticationError('Authentication required')
		}

		// Get user ID
		const userId = parseInt(req.jwtPayload.sub, 10)

		// Check permission
		const allowed = await rbac.hasPermission(userId, action)

		// Denied?
		if( ! allowed)
		{
			throw new ForbiddenError(`Missing permission: ${action}`)
		}

		// Continue
		next()
	}
}

/*
 * Require Any Permission Middleware Factory
 *
 * User needs at least one of the listed permissions.
 *
 * @param actions Array of permission action strings
 * @returns Express middleware
 */
export function requireAnyPermission(actions: string[])
{
	return async function(req: Request, _res: Response, next: NextFunction): Promise<void>
	{
		// API key auth
		if(req.apiKeyPermissions)
		{
			if(req.apiKeyPermissions.includes('*'))
			{
				next()
				return
			}

			const found = actions.some(a => req.apiKeyPermissions!.includes(a))

			if( ! found)
			{
				throw new ForbiddenError(`Missing one of permissions: ${actions.join(', ')}`)
			}

			next()
			return
		}

		// JWT auth
		if( ! req.jwtPayload?.sub)
		{
			throw new AuthenticationError('Authentication required')
		}

		const userId = parseInt(req.jwtPayload.sub, 10)
		const allowed = await rbac.hasAnyPermission(userId, actions)

		if( ! allowed)
		{
			throw new ForbiddenError(`Missing one of permissions: ${actions.join(', ')}`)
		}

		next()
	}
}
