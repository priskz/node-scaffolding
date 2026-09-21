/*
 * API Key Types
 */

export interface ApiKeyCreateResult
{
	id: string
	name: string
	prefix: string
	key: string
	permissions: string[]
	expiresAt: Date | null
}

export interface ApiKeyValidateResult
{
	id: string
	name: string
	userId: number
	permissions: string[]
}

export interface ApiKeyCreateOptions
{
	name: string
	userId: number
	permissions?: string[]
	expiresAt?: Date
}
