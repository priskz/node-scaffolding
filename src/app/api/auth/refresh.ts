import { Request, Response } from 'express'
import { z } from 'zod'
import { jwt } from '~/lib/util'
import { AuthenticationError } from '~/lib/error'

/*
 * Refresh Schema
 */
const refreshSchema = z.object({
	refreshToken: z.string().min(1)
})

/*
 * Refresh Token
 *
 * Accepts a valid refresh token, returns a new token pair.
 */
export async function refresh(req: Request, res: Response): Promise<void>
{
	// Validate
	const input = refreshSchema.safeParse(req.body)

	// Invalid?
	if( ! input.success)
	{
		throw new AuthenticationError('Refresh token is required')
	}

	// Verify refresh token
	const payload = await jwt.verifyToken(input.data.refreshToken)

	// Invalid?
	if( ! payload)
	{
		throw new AuthenticationError('Invalid or expired refresh token')
	}

	// Wrong type?
	if(payload.type !== 'refresh')
	{
		throw new AuthenticationError('Invalid token type')
	}

	// Generate new token pair
	const tokens = await jwt.generateTokens(payload.sub)

	// Success
	res.status(200).json(tokens)
}
