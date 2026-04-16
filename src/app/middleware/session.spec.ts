import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGetOneById, mockTouch, mockGenerate, mockTimeNow, mockTimeParse } =
	vi.hoisted(() => ({
		mockGetOneById: vi.fn(),
		mockTouch: vi.fn(),
		mockGenerate: vi.fn(),
		mockTimeNow: vi.fn(),
		mockTimeParse: vi.fn(),
	}))

vi.mock('~/config', () => ({
	config: { session: { cookie: 'sid' } },
}))

vi.mock('~/lib/util', () => ({
	time: { now: mockTimeNow, parse: mockTimeParse },
	respond: (_req: unknown, res: { status: (n: number) => unknown; json: (d: unknown) => unknown }) => ({
		error: (data: unknown, code: number = 400) =>
		{
			res.status(code)
			res.json(data)
		},
	}),
}))

vi.mock('~/app/service', () => ({
	SessionRoot: class
	{
		public getOneById(id: string) { return mockGetOneById(id) }
		public touch(id: string) { return mockTouch(id) }
		public generate(agent: string, ip?: string) { return mockGenerate(agent, ip) }
	},
}))

import { session, isExpired, getAgent, getIpAddress } from './session'
import type { Request, Response, NextFunction } from 'express'

function mockResponse()
{
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		clearCookie: vi.fn().mockReturnThis(),
		cookie: vi.fn().mockReturnThis(),
	}
	return res
}

describe('app/middleware/session — helpers', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	describe('getAgent', () =>
	{
		it('returns user-agent when set', () =>
		{
			expect(getAgent({ headers: { 'user-agent': 'mozilla' } } as unknown as Request)).toBe('mozilla')
		})

		it('falls back when user-agent missing', () =>
		{
			expect(getAgent({ headers: {} } as Request)).toBe('No Agent Found')
		})
	})

	describe('getIpAddress', () =>
	{
		it('returns x-forwarded-for when present', () =>
		{
			const ip = getIpAddress({
				headers: { 'x-forwarded-for': '9.9.9.9' },
				ip: '1.2.3.4',
				connection: { remoteAddress: '5.6.7.8' },
			} as unknown as Request)
			expect(ip).toBe('9.9.9.9')
		})

		it('falls back to req.ip when no forwarded header', () =>
		{
			const ip = getIpAddress({ headers: {}, ip: '1.2.3.4' } as unknown as Request)
			expect(ip).toBe('1.2.3.4')
		})
	})

	describe('isExpired', () =>
	{
		it('returns false when session has no expiration', () =>
		{
			expect(isExpired({ expiresAt: null } as never)).toBe(false)
		})

		it('returns true when current time is past expiration', () =>
		{
			mockTimeParse.mockReturnValue(new Date('2026-01-01T00:00:00Z'))
			mockTimeNow.mockReturnValue(new Date('2026-01-02T00:00:00Z'))

			expect(isExpired({ expiresAt: new Date('2026-01-01T00:00:00Z') } as never)).toBe(true)
		})
	})
})

describe('app/middleware/session — middleware', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should create a new session when none on request', async () =>
	{
		const created = {
			id: 'new-sid',
			expiresAt: new Date('2026-02-01T00:00:00Z'),
		}
		mockGenerate.mockResolvedValue(created)

		const req = {
			signedCookies: {},
			headers: { 'user-agent': 'mozilla' },
			ip: '1.2.3.4',
			setSession: vi.fn(),
		}
		const res = mockResponse()
		const next = vi.fn() as unknown as NextFunction

		await session(req as unknown as Request, res as unknown as Response, next)

		expect(mockGenerate).toHaveBeenCalled()
		expect(res.cookie).toHaveBeenCalledWith('sid', 'new-sid', expect.any(Object))
		expect(req.setSession).toHaveBeenCalledWith(created)
		expect(next).toHaveBeenCalled()
	})

	it('should reject tampered cookie (signedCookies returns false)', async () =>
	{
		const req = {
			signedCookies: { sid: false },
			headers: {},
			ip: '1.2.3.4',
			setSession: vi.fn(),
		}
		const res = mockResponse()
		const next = vi.fn() as unknown as NextFunction

		await session(req as unknown as Request, res as unknown as Response, next)

		expect(res.clearCookie).toHaveBeenCalledWith('sid')
		expect(res.status).toHaveBeenCalledWith(401)
		expect(next).not.toHaveBeenCalled()
	})

	it('should 404 when session id present but not found', async () =>
	{
		mockGetOneById.mockResolvedValue(undefined)

		const req = {
			signedCookies: { sid: 'known-sid' },
			headers: {},
			ip: '1.2.3.4',
			setSession: vi.fn(),
		}
		const res = mockResponse()
		const next = vi.fn() as unknown as NextFunction

		await session(req as unknown as Request, res as unknown as Response, next)

		expect(res.clearCookie).toHaveBeenCalledWith('sid')
		expect(res.status).toHaveBeenCalledWith(404)
		expect(next).not.toHaveBeenCalled()
	})

	it('should attach existing session and touch it when not expired', async () =>
	{
		const existing = {
			id: 'known-sid',
			expiresAt: new Date('2030-01-01T00:00:00Z'),
		}
		mockGetOneById.mockResolvedValue(existing)
		mockTimeParse.mockReturnValue(new Date('2030-01-01T00:00:00Z'))
		mockTimeNow.mockReturnValue(new Date('2026-01-01T00:00:00Z'))
		mockTouch.mockResolvedValue(undefined)

		const req = {
			signedCookies: { sid: 'known-sid' },
			headers: {},
			ip: '1.2.3.4',
			setSession: vi.fn(),
		}
		const res = mockResponse()
		const next = vi.fn() as unknown as NextFunction

		await session(req as unknown as Request, res as unknown as Response, next)

		expect(mockTouch).toHaveBeenCalledWith('known-sid')
		expect(req.setSession).toHaveBeenCalledWith(existing)
		expect(next).toHaveBeenCalled()
	})
})
