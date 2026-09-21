import { generateSecret, generateURI, verifySync } from 'otplib'
import { randomBytes, createHash } from 'crypto'
import { database } from '~/lib/util/database'
import { env } from '~/lib/util/env'
import type { TotpSetupResult, TotpVerifyResult } from './types'

const RECOVERY_CODE_BYTES = 16

/*
 * Generate TOTP setup — secret, QR URI, and recovery codes
 *
 * Does NOT enable 2FA yet. The caller must verify a token
 * before calling enableTotp() to confirm the user has the secret.
 *
 * @param userId User to set up TOTP for
 * @param email Used in the QR code label
 * @returns Secret, otpauth URI for QR rendering, and plaintext recovery codes
 */
async function generateSetup(userId: number, email: string): Promise<TotpSetupResult>
{
	// Generate secret
	const secret = generateSecret()

	// Build otpauth URI
	const uri = generateURI({
		label: email,
		issuer: env.TOTP_ISSUER,
		secret,
	})

	// Generate recovery codes
	const recoveryCount = env.RECOVERY_CODE_COUNT
	const plainCodes: string[] = []
	const hashedCodes: string[] = []

	for(let i = 0; i < recoveryCount; i++)
	{
		const code = randomBytes(RECOVERY_CODE_BYTES).toString('hex')
		plainCodes.push(code)
		hashedCodes.push(_hashCode(code))
	}

	// Store secret + hashed recovery codes (not yet enabled)
	const prisma = database.client()
	await prisma.user.update({
		where: { id: userId },
		data: {
			totpSecret: secret,
			recoveryCodes: hashedCodes,
		},
	})

	return { secret, uri, recoveryCodes: plainCodes }
}

/*
 * Enable TOTP — called after user verifies a token
 *
 * @param userId User to enable TOTP for
 * @param token TOTP token to verify before enabling
 * @returns True if token was valid and 2FA is now enabled
 */
async function enableTotp(userId: number, token: string): Promise<boolean>
{
	const prisma = database.client()

	// Get user secret
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { totpSecret: true },
	})

	// No secret?
	if( ! user?.totpSecret) return false

	// Verify token against secret
	const result = verifySync({ token, secret: user.totpSecret })

	// Invalid?
	if( ! result.valid) return false

	// Enable 2FA
	await prisma.user.update({
		where: { id: userId },
		data: { totpEnabled: true },
	})

	return true
}

/*
 * Disable TOTP for a user
 *
 * Clears secret, recovery codes, and sets totpEnabled to false.
 *
 * @param userId User to disable TOTP for
 */
async function disableTotp(userId: number): Promise<void>
{
	const prisma = database.client()
	await prisma.user.update({
		where: { id: userId },
		data: {
			totpEnabled: false,
			totpSecret: null,
			recoveryCodes: [],
		},
	})
}

/*
 * Verify a TOTP token
 *
 * @param userId User whose TOTP to verify
 * @param token The 6-digit TOTP token
 * @returns Verification result
 */
async function verifyToken(userId: number, token: string): Promise<TotpVerifyResult>
{
	const prisma = database.client()

	// Get user
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { totpSecret: true, totpEnabled: true },
	})

	// Not enabled?
	if( ! user?.totpEnabled || ! user.totpSecret)
	{
		return { valid: false }
	}

	// Verify
	const result = verifySync({ token, secret: user.totpSecret })

	return { valid: result.valid }
}

/*
 * Consume a recovery code
 *
 * Finds matching hashed code, removes it from the array, returns whether it matched.
 * Each recovery code is single-use.
 *
 * @param userId User whose recovery code to consume
 * @param code Plaintext recovery code from the user
 * @returns True if the code was valid and consumed
 */
async function consumeRecoveryCode(userId: number, code: string): Promise<boolean>
{
	const prisma = database.client()
	const hashed = _hashCode(code)

	// Get user recovery codes
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { recoveryCodes: true },
	})

	// No codes?
	if( ! user) return false

	// Find matching code
	const index = user.recoveryCodes.indexOf(hashed)

	// Not found?
	if(index === -1) return false

	// Remove consumed code
	const remaining = [...user.recoveryCodes]
	remaining.splice(index, 1)

	await prisma.user.update({
		where: { id: userId },
		data: { recoveryCodes: remaining },
	})

	return true
}

/*
 * Check if a user has 2FA enabled
 *
 * @param userId User to check
 * @returns True if TOTP is enabled
 */
async function hasTotpEnabled(userId: number): Promise<boolean>
{
	const prisma = database.client()
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { totpEnabled: true },
	})

	return user?.totpEnabled ?? false
}

/*
 * Hash a recovery code — SHA-256
 */
function _hashCode(code: string): string
{
	return createHash('sha256').update(code).digest('hex')
}

export { _hashCode as hashCode }
export const totp = {
	generateSetup,
	enableTotp,
	disableTotp,
	verifyToken,
	consumeRecoveryCode,
	hasTotpEnabled,
}
