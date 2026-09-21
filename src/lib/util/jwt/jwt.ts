import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { env } from '~/lib/util/env'

/*
 * Token Payload
 */
export interface TokenPayload extends JWTPayload
{
	sub: string
	type: 'access' | 'refresh'
}

/*
 * Token Pair
 */
export interface TokenPair
{
	accessToken: string
	refreshToken: string
}

/*
 * Get signing key — derived from JWT_SECRET
 */
function _getSigningKey(): Uint8Array
{
	return new TextEncoder().encode(env.JWT_SECRET)
}

/*
 * Sign a token
 */
async function _sign(
	subject: string,
	type: 'access' | 'refresh',
	expiry: string
): Promise<string>
{
	// Build token
	const token = await new SignJWT({ type })
		.setProtectedHeader({ alg: 'HS256' })
		.setSubject(subject)
		.setIssuer(env.JWT_ISSUER)
		.setIssuedAt()
		.setExpirationTime(expiry)
		.sign(_getSigningKey())

	return token
}

/*
 * Generate a token pair — access + refresh
 */
async function generateTokens(subject: string): Promise<TokenPair>
{
	// Generate both tokens
	const [accessToken, refreshToken] = await Promise.all([
		_sign(subject, 'access', env.JWT_ACCESS_EXPIRY),
		_sign(subject, 'refresh', env.JWT_REFRESH_EXPIRY)
	])

	return { accessToken, refreshToken }
}

/*
 * Verify a token — returns payload or undefined
 */
async function verifyToken(token: string): Promise<TokenPayload | undefined>
{
	try
	{
		// Verify
		const { payload } = await jwtVerify(token, _getSigningKey(), {
			issuer: env.JWT_ISSUER
		})

		return payload as TokenPayload
	}
	catch
	{
		return undefined
	}
}

/*
 * Export Util
 */
export const jwt = {
	generateTokens,
	verifyToken
}
