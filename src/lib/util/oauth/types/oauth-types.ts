export interface OAuthProfile
{
	provider: string
	providerId: string
	email: string
	firstName: string | undefined
	lastName: string | undefined
	raw: Record<string, unknown>
}

export interface OAuthLinkResult
{
	userId: number
	provider: string
	providerId: string
	created: boolean
}

export interface OAuthProviderOptions
{
	clientId: string
	clientSecret: string
	callbackUrl: string
}

type ProviderName = 'google' | 'github'

export type { ProviderName }
