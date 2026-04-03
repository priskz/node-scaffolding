import passport from 'passport'
import { Request, Response, NextFunction } from 'express'
import { oauth } from '~/lib/util/oauth'
import { jwt } from '~/lib/util/jwt'
import { log } from '~/lib/util/log'
import type { OAuthProfile } from '~/lib/util/oauth'

let _logger: ReturnType<typeof log.child>
function _log(): ReturnType<typeof log.child>
{
	if( ! _logger) _logger = log.child('OAuthMiddleware')
	return _logger
}

/*
 * Passport Initialize — add to Express middleware stack
 */
export const passportInit = passport.initialize()

/*
 * OAuth Callback Handler Factory
 *
 * Creates a middleware that handles the OAuth provider callback.
 * On success: finds or creates user, issues JWT tokens, redirects or responds with JSON.
 * On failure: returns 401.
 *
 * @param provider The OAuth provider name (google, github)
 * @returns Express middleware
 */
export function oauthCallback(provider: string)
{
	return function(req: Request, res: Response, next: NextFunction): void
	{
		passport.authenticate(provider, { session: false }, async (err: any, profile: OAuthProfile | false) =>
		{
			// Auth error?
			if(err)
			{
				_log().error({ err, provider }, 'OAuth authentication error')
				res.status(500).json({ error: 'OAuth authentication failed' })
				return
			}

			// No profile?
			if( ! profile)
			{
				res.status(401).json({ error: 'OAuth authentication denied' })
				return
			}

			try
			{
				// Find or create user
				const result = await oauth.findOrCreateUser(profile)

				// Generate tokens
				const tokens = await jwt.generateTokens(String(result.userId))

				// Return tokens
				res.json({
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken,
					userId: result.userId,
					created: result.created,
				})
			}
			catch(error)
			{
				_log().error({ error, provider }, 'OAuth user creation failed')
				res.status(500).json({ error: 'Failed to process OAuth login' })
			}
		})(req, res, next)
	}
}

/*
 * OAuth Initiate Factory
 *
 * Creates a middleware that redirects to the provider's OAuth consent screen.
 *
 * @param provider The OAuth provider name (google, github)
 * @param scope OAuth scopes to request
 * @returns Express middleware
 */
export function oauthInitiate(provider: string, scope: string[])
{
	return passport.authenticate(provider, { scope, session: false })
}
