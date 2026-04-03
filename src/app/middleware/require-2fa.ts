import { Request, Response, NextFunction } from 'express'
import { totp } from '~/lib/util/totp'
import { AuthenticationError } from '~/lib/error'

/*
 * Require 2FA Middleware
 *
 * Guards sensitive routes for users who have TOTP enabled.
 * Checks req.twoFactorVerified — set by the 2FA verification endpoint
 * after the user provides a valid TOTP token.
 *
 * Users without 2FA enabled pass through — the guard only applies
 * to users who have opted into 2FA.
 *
 * Must be placed after authenticate middleware (needs req.jwtPayload).
 */
export function require2FA()
{
	return async function(req: Request, _res: Response, next: NextFunction): Promise<void>
	{
		// No JWT context? Let authenticate middleware handle it
		if( ! req.jwtPayload?.sub) { next(); return }

		// Check if user has 2FA enabled
		const userId = parseInt(req.jwtPayload.sub, 10)
		const enabled = await totp.hasTotpEnabled(userId)

		// 2FA not enabled — pass through
		if( ! enabled) { next(); return }

		// 2FA enabled — check verification
		if( ! req.twoFactorVerified)
		{
			throw new AuthenticationError('Two-factor authentication required')
		}

		next()
	}
}
