import { Request, Response, NextFunction } from 'express'
import { apiKey } from '~/lib/util/api-key'
import { AuthenticationError } from '~/lib/error'

/*
 * API Key Authentication Middleware
 *
 * Validates the X-API-Key header. Looks up the key by prefix,
 * compares the full hash, and attaches the scoped permissions
 * to req.apiKeyPermissions.
 */
export async function apiKeyAuth(
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void>
{
	// Extract header
	const key = req.headers['x-api-key']

	// Missing?
	if( ! key || typeof key !== 'string')
	{
		throw new AuthenticationError('Missing X-API-Key header')
	}

	// Validate
	const result = await apiKey.validateApiKey(key)

	// Invalid?
	if( ! result)
	{
		throw new AuthenticationError('Invalid or expired API key')
	}

	// Attach permissions to request
	req.apiKeyPermissions = result.permissions

	// Continue
	next()
}
