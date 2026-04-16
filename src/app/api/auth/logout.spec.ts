import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockLogout } = vi.hoisted(() => ({
	mockLogout: vi.fn(),
}))

vi.mock('~/lib/util', () => ({
	respond: (_req: unknown, res: { status: (n: number) => unknown; json: (d: unknown) => unknown }) => ({
		success: (data?: unknown, code: number = 200) =>
		{
			res.status(code === 200 && data === undefined ? 204 : code)
			res.json(data)
		},
		error: (data?: unknown, code: number = 400) =>
		{
			res.status(code)
			res.json(data)
		},
	}),
}))

vi.mock('~/config', () => ({
	config: { session: { cookie: 'sid' } },
}))

vi.mock('~/app/service', () => ({
	AuthRoot: class
	{
		public logout(session: unknown) { return mockLogout(session) }
	},
}))

import { logout } from './logout'
import type { Request, Response } from 'express'

function mockRes()
{
	return {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		clearCookie: vi.fn().mockReturnThis(),
	}
}

describe('app/api/auth/logout', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should 400 when request has no session', async () =>
	{
		const req = { getSession: () => undefined }
		const res = mockRes()

		await logout(req as unknown as Request, res as unknown as Response)

		expect(mockLogout).not.toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(400)
	})

	it('should 400 when session has no userId (not logged in)', async () =>
	{
		const req = { getSession: () => ({ id: 'sid', userId: null }) }
		const res = mockRes()

		await logout(req as unknown as Request, res as unknown as Response)

		expect(mockLogout).not.toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(400)
	})

	it('should expire session, clear cookie, and respond 204 on success', async () =>
	{
		mockLogout.mockResolvedValue(true)

		const req = { getSession: () => ({ id: 'sid', userId: 1 }) }
		const res = mockRes()

		await logout(req as unknown as Request, res as unknown as Response)

		expect(mockLogout).toHaveBeenCalledWith({ id: 'sid', userId: 1 })
		expect(res.clearCookie).toHaveBeenCalledWith('sid')
		expect(res.status).toHaveBeenCalledWith(204)
	})
})
