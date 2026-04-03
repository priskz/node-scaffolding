import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { database } from '~/lib/util/database'
import { log } from '~/lib/util/log'
import type { Prisma } from '~/generated/prisma/client'
import type { OAuthProfile, OAuthLinkResult, OAuthProviderOptions, ProviderName } from './types'

let _logger: ReturnType<typeof log.child>
function _log(): ReturnType<typeof log.child>
{
	if( ! _logger) _logger = log.child('OAuthService')
	return _logger
}

/*
 * Register Google Strategy
 */
function registerGoogle(options: OAuthProviderOptions): void
{
	passport.use(new GoogleStrategy(
		{
			clientID: options.clientId,
			clientSecret: options.clientSecret,
			callbackURL: options.callbackUrl,
			scope: ['profile', 'email'],
		},
		(_accessToken: string, _refreshToken: string, profile: any, done: any) =>
		{
			// Normalize profile
			const normalized = _normalizeGoogle(profile)
			done(null, normalized)
		}
	))

	_log().info('Google OAuth strategy registered')
}

/*
 * Register GitHub Strategy
 */
function registerGitHub(options: OAuthProviderOptions): void
{
	passport.use(new GitHubStrategy(
		{
			clientID: options.clientId,
			clientSecret: options.clientSecret,
			callbackURL: options.callbackUrl,
			scope: ['user:email'],
		},
		(_accessToken: string, _refreshToken: string, profile: any, done: any) =>
		{
			// Normalize profile
			const normalized = _normalizeGitHub(profile)
			done(null, normalized)
		}
	))

	_log().info('GitHub OAuth strategy registered')
}

/*
 * Find or create user from OAuth profile
 *
 * Looks up existing OAuthAccount by provider + providerId.
 * If found, returns the linked user. If not, creates user + link.
 * @param profile Normalized OAuth profile
 * @returns Link result with userId and whether a new user was created
 */
async function findOrCreateUser(profile: OAuthProfile): Promise<OAuthLinkResult>
{
	const prisma = database.client()

	// Check existing link
	const existing = await prisma.oAuthAccount.findUnique({
		where: {
			provider_providerId: {
				provider: profile.provider,
				providerId: profile.providerId,
			},
		},
	})

	// Already linked?
	if(existing)
	{
		_log().debug({ provider: profile.provider, userId: existing.userId }, 'existing OAuth link found')
		return { userId: existing.userId, provider: profile.provider, providerId: profile.providerId, created: false }
	}

	// Check if user with this email already exists
	const existingUser = await prisma.user.findUnique({
		where: { email: profile.email },
	})

	// User exists — link account
	if(existingUser)
	{
		await prisma.oAuthAccount.create({
			data: {
				provider: profile.provider,
				providerId: profile.providerId,
				userId: existingUser.id,
				profile: profile.raw as Prisma.InputJsonValue,
			},
		})

		_log().info({ provider: profile.provider, userId: existingUser.id }, 'OAuth account linked to existing user')
		return { userId: existingUser.id, provider: profile.provider, providerId: profile.providerId, created: false }
	}

	// Create user + link in transaction
	const result = await prisma.$transaction(async (tx) =>
	{
		// Create user
		const user = await tx.user.create({
			data: {
				email: profile.email,
				firstName: profile.firstName ?? null,
				lastName: profile.lastName ?? null,
			},
		})

		// Link OAuth account
		await tx.oAuthAccount.create({
			data: {
				provider: profile.provider,
				providerId: profile.providerId,
				userId: user.id,
				profile: profile.raw as Prisma.InputJsonValue,
			},
		})

		return user
	})

	_log().info({ provider: profile.provider, userId: result.id }, 'new user created via OAuth')
	return { userId: result.id, provider: profile.provider, providerId: profile.providerId, created: true }
}

/*
 * Link an OAuth account to an existing user
 *
 * @param userId User to link to
 * @param profile OAuth profile from provider
 * @returns Link result
 * @throws ConflictError if account is already linked to a different user
 */
async function linkAccount(userId: number, profile: OAuthProfile): Promise<OAuthLinkResult>
{
	const prisma = database.client()

	// Check existing link
	const existing = await prisma.oAuthAccount.findUnique({
		where: {
			provider_providerId: {
				provider: profile.provider,
				providerId: profile.providerId,
			},
		},
	})

	// Already linked to this user?
	if(existing && existing.userId === userId)
	{
		return { userId, provider: profile.provider, providerId: profile.providerId, created: false }
	}

	// Linked to another user?
	if(existing)
	{
		throw new Error(`OAuth account already linked to another user`)
	}

	// Create link
	await prisma.oAuthAccount.create({
		data: {
			provider: profile.provider,
			providerId: profile.providerId,
			userId,
			profile: profile.raw as Prisma.InputJsonValue,
		},
	})

	_log().info({ provider: profile.provider, userId }, 'OAuth account linked')
	return { userId, provider: profile.provider, providerId: profile.providerId, created: true }
}

/*
 * Unlink an OAuth account from a user
 *
 * @param userId User to unlink from
 * @param provider Provider name
 * @returns True if unlinked, false if link not found
 */
async function unlinkAccount(userId: number, provider: ProviderName): Promise<boolean>
{
	const prisma = database.client()

	// Find link
	const account = await prisma.oAuthAccount.findFirst({
		where: { userId, provider },
	})

	// Not found?
	if( ! account) return false

	// Delete link
	await prisma.oAuthAccount.delete({ where: { id: account.id } })

	_log().info({ provider, userId }, 'OAuth account unlinked')
	return true
}

/*
 * Get linked providers for a user
 */
async function getLinkedProviders(userId: number): Promise<string[]>
{
	const prisma = database.client()
	const accounts = await prisma.oAuthAccount.findMany({
		where: { userId },
		select: { provider: true },
	})

	return accounts.map(a => a.provider)
}

/*
 * Normalize Google profile to OAuthProfile
 */
function _normalizeGoogle(profile: any): OAuthProfile
{
	return {
		provider: 'google',
		providerId: profile.id,
		email: profile.emails?.[0]?.value ?? '',
		firstName: profile.name?.givenName,
		lastName: profile.name?.familyName,
		raw: profile._json ?? {},
	}
}

/*
 * Normalize GitHub profile to OAuthProfile
 */
function _normalizeGitHub(profile: any): OAuthProfile
{
	return {
		provider: 'github',
		providerId: profile.id,
		email: profile.emails?.[0]?.value ?? '',
		firstName: profile.displayName?.split(' ')[0],
		lastName: profile.displayName?.split(' ').slice(1).join(' ') || undefined,
		raw: profile._json ?? {},
	}
}

export const oauth = {
	registerGoogle,
	registerGitHub,
	findOrCreateUser,
	linkAccount,
	unlinkAccount,
	getLinkedProviders,
}
