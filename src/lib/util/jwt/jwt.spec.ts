import { describe, it, expect } from 'vitest'
import { jwt } from './jwt'

describe('lib/util/jwt', () =>
{
	describe('generateTokens', () =>
	{
		it('should return an access and refresh token pair', async () =>
		{
			// Action
			const tokens = await jwt.generateTokens('user-123')

			// Assert
			expect(tokens.accessToken).toBeDefined()
			expect(tokens.refreshToken).toBeDefined()
			expect(typeof tokens.accessToken).toBe('string')
			expect(typeof tokens.refreshToken).toBe('string')
			expect(tokens.accessToken).not.toBe(tokens.refreshToken)
		})
	})

	describe('verifyToken', () =>
	{
		it('should verify a valid access token', async () =>
		{
			// Init
			const tokens = await jwt.generateTokens('user-456')

			// Action
			const payload = await jwt.verifyToken(tokens.accessToken)

			// Assert
			expect(payload).toBeDefined()
			expect(payload?.sub).toBe('user-456')
			expect(payload?.type).toBe('access')
		})

		it('should verify a valid refresh token', async () =>
		{
			// Init
			const tokens = await jwt.generateTokens('user-789')

			// Action
			const payload = await jwt.verifyToken(tokens.refreshToken)

			// Assert
			expect(payload).toBeDefined()
			expect(payload?.sub).toBe('user-789')
			expect(payload?.type).toBe('refresh')
		})

		it('should return undefined for an invalid token', async () =>
		{
			// Action
			const payload = await jwt.verifyToken('invalid-token')

			// Assert
			expect(payload).toBeUndefined()
		})

		it('should return undefined for a tampered token', async () =>
		{
			// Init
			const tokens = await jwt.generateTokens('user-000')
			const tampered = tokens.accessToken.slice(0, -5) + 'XXXXX'

			// Action
			const payload = await jwt.verifyToken(tampered)

			// Assert
			expect(payload).toBeUndefined()
		})
	})
})
