import { randomBytes, createHash } from 'crypto'
import { database } from '~/lib/util/database'
import type { ApiKeyCreateOptions, ApiKeyCreateResult, ApiKeyValidateResult } from './types'

/*
 * Prefix length — first 8 characters of the key, stored in plaintext
 * for fast lookup without scanning all hashes.
 */
const PREFIX_LENGTH = 8

/*
 * Key length — full random key in bytes (32 bytes = 64 hex characters)
 */
const KEY_BYTES = 32

/*
 * Generate API Key
 *
 * Creates a new API key. Returns the plaintext key exactly once —
 * only the SHA-256 hash is persisted. The prefix is stored separately
 * for fast lookup.
 *
 * @param options Key creation options
 * @returns The created key record with the plaintext key
 */
async function generateApiKey(options: ApiKeyCreateOptions): Promise<ApiKeyCreateResult>
{
	// Generate random key
	const rawKey = randomBytes(KEY_BYTES).toString('hex')

	// Extract prefix for fast lookup
	const prefix = rawKey.slice(0, PREFIX_LENGTH)

	// Hash the full key
	const hash = _hashKey(rawKey)

	// Get prisma client
	const prisma = database.client()

	// Persist
	const record = await prisma.apiKey.create({
		data: {
			name: options.name,
			prefix,
			hash,
			userId: options.userId,
			permissions: options.permissions ?? [],
			expiresAt: options.expiresAt ?? null,
		},
	})

	return {
		id: record.id,
		name: record.name,
		prefix: record.prefix,
		key: rawKey,
		permissions: record.permissions,
		expiresAt: record.expiresAt,
	}
}

/*
 * Validate API Key
 *
 * Looks up the key by prefix, then compares the full hash.
 * Returns the key record if valid, undefined if not.
 *
 * @param rawKey The plaintext API key from the request
 * @returns Validation result or undefined
 */
async function validateApiKey(rawKey: string): Promise<ApiKeyValidateResult | undefined>
{
	// Too short?
	if(rawKey.length < PREFIX_LENGTH) return undefined

	// Extract prefix
	const prefix = rawKey.slice(0, PREFIX_LENGTH)

	// Hash the provided key
	const hash = _hashKey(rawKey)

	// Get prisma client
	const prisma = database.client()

	// Lookup by prefix
	const record = await prisma.apiKey.findUnique({
		where: { prefix },
	})

	// Not found?
	if( ! record) return undefined

	// Inactive?
	if( ! record.active) return undefined

	// Expired?
	if(record.expiresAt && record.expiresAt < new Date()) return undefined

	// Hash mismatch?
	if(record.hash !== hash) return undefined

	// Update last used timestamp — fire and forget
	prisma.apiKey.update({
		where: { id: record.id },
		data: { lastUsedAt: new Date() },
	}).catch(() => {})

	return {
		id: record.id,
		name: record.name,
		userId: record.userId,
		permissions: record.permissions,
	}
}

/*
 * Revoke API Key
 *
 * Deactivates a key by ID. Does not delete — preserves audit trail.
 *
 * @param id The API key ID
 * @returns true if revoked, false if not found
 */
async function revokeApiKey(id: string): Promise<boolean>
{
	// Get prisma client
	const prisma = database.client()

	try
	{
		await prisma.apiKey.update({
			where: { id },
			data: { active: false },
		})

		return true
	}
	catch
	{
		return false
	}
}

/*
 * Hash Key — SHA-256
 */
function _hashKey(key: string): string
{
	return createHash('sha256').update(key).digest('hex')
}

/*
 * Export — for testing
 */
export { _hashKey as hashKey }

/*
 * Export Service
 */
export const apiKey = {
	generateApiKey,
	validateApiKey,
	revokeApiKey,
}
