import { env } from '~/lib/util/env'

export interface OAuthProviderConfig
{
	enabled: boolean
	clientId: string
	clientSecret: string
	callbackUrl: string
}

export interface OAuthConfig
{
	google: OAuthProviderConfig
	github: OAuthProviderConfig
}

export const oauth: OAuthConfig =
{
	google:
	{
		enabled: env.OAUTH_GOOGLE_ENABLED === 'true',
		clientId: env.OAUTH_GOOGLE_CLIENT_ID ?? '',
		clientSecret: env.OAUTH_GOOGLE_CLIENT_SECRET ?? '',
		callbackUrl: env.OAUTH_GOOGLE_CALLBACK_URL,
	},
	github:
	{
		enabled: env.OAUTH_GITHUB_ENABLED === 'true',
		clientId: env.OAUTH_GITHUB_CLIENT_ID ?? '',
		clientSecret: env.OAUTH_GITHUB_CLIENT_SECRET ?? '',
		callbackUrl: env.OAUTH_GITHUB_CALLBACK_URL,
	},
}
