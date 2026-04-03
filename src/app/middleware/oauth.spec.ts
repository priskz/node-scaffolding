import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Hoisted mocks
 */
const { mockFindOrCreateUser, mockGenerateTokens, mockAuthenticate } = vi.hoisted(() => ({
	mockFindOrCreateUser: vi.fn(),
	mockGenerateTokens: vi.fn(),
	mockAuthenticate: vi.fn(),
}))

vi.mock('~/lib/util/oauth', () => ({
	oauth: {
		findOrCreateUser: mockFindOrCreateUser,
	},
}))

vi.mock('~/lib/util/jwt', () => ({
	jwt: {
		generateTokens: mockGenerateTokens,
	},
}))

vi.mock('~/lib/util/log', () => ({
	log: {
		child: () => ({
			info: vi.fn(),
			debug: vi.fn(),
			error: vi.fn(),
		}),
	},
}))

vi.mock('passport', () => ({
	default: {
		initialize: () => vi.fn(),
		authenticate: mockAuthenticate,
	},
}))

import { oauthCallback } from './oauth'
import type { Request, Response, NextFunction } from 'express'

function _mockReqRes(): { req: Partial<Request>; res: Partial<Response>; next: NextFunction }
{
	return {
		req: {} as Partial<Request>,
		res: {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		} as Partial<Response>,
		next: vi.fn(),
	}
}

describe('app/middleware/oauth', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	describe('oauthCallback', () =>
	{
		it('should return tokens on successful OAuth', async () =>
		{
			// Init
			const { req, res, next } = _mockReqRes()

			mockAuthenticate.mockImplementation((_provider: string, _opts: any, cb: any) =>
			{
				return (_req: any, _res: any, _next: any) =>
				{
					cb(null, {
						provider: 'google',
						providerId: 'g-123',
						email: 'test@test.com',
						firstName: 'Test',
						lastName: 'User',
						raw: {},
					})
				}
			})

			mockFindOrCreateUser.mockResolvedValue({
				userId: 42,
				provider: 'google',
				providerId: 'g-123',
				created: false,
			})

			mockGenerateTokens.mockResolvedValue({
				accessToken: 'access-tok',
				refreshToken: 'refresh-tok',
			})

			// Action
			const middleware = oauthCallback('google')
			middleware(req as Request, res as Response, next)

			// Wait for async callback
			await vi.waitFor(() =>
			{
				expect(res.json).toHaveBeenCalled()
			})

			// Assert
			expect(res.json).toHaveBeenCalledWith({
				accessToken: 'access-tok',
				refreshToken: 'refresh-tok',
				userId: 42,
				created: false,
			})
		})

		it('should return 401 when OAuth is denied', () =>
		{
			// Init
			const { req, res, next } = _mockReqRes()

			mockAuthenticate.mockImplementation((_provider: string, _opts: any, cb: any) =>
			{
				return (_req: any, _res: any, _next: any) =>
				{
					cb(null, false)
				}
			})

			// Action
			const middleware = oauthCallback('google')
			middleware(req as Request, res as Response, next)

			// Assert
			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({ error: 'OAuth authentication denied' })
		})

		it('should return 500 when OAuth errors', () =>
		{
			// Init
			const { req, res, next } = _mockReqRes()

			mockAuthenticate.mockImplementation((_provider: string, _opts: any, cb: any) =>
			{
				return (_req: any, _res: any, _next: any) =>
				{
					cb(new Error('Provider error'), null)
				}
			})

			// Action
			const middleware = oauthCallback('google')
			middleware(req as Request, res as Response, next)

			// Assert
			expect(res.status).toHaveBeenCalledWith(500)
			expect(res.json).toHaveBeenCalledWith({ error: 'OAuth authentication failed' })
		})
	})
})
