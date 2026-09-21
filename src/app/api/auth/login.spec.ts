import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockLogin } = vi.hoisted(() => ({
	mockLogin: vi.fn(),
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
		public login(...args: unknown[]) { return mockLogin(...args) }
	},
}))

import { login } from './login'
import type { Request, Response } from 'express'

function mockRes()
{
	return {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		cookie: vi.fn().mockReturnThis(),
	}
}

describe('app/api/auth/login', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should reject when request already has a user', async () =>
	{
		const req = {
			body: { email: 'a@b.com', pass: 'x' },
			getUser: () => ({ id: 1 }),
			getSession: () => ({ id: 'sid' }),
			setSession: vi.fn(),
		}
		const res = mockRes()

		await login(req as unknown as Request, res as unknown as Response)

		expect(mockLogin).not.toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(400)
	})

	it('should 400 on invalid input', async () =>
	{
		const req = {
			body: { email: 'not-an-email', pass: '' },
			getUser: () => undefined,
			getSession: () => ({ id: 'sid' }),
			setSession: vi.fn(),
		}
		const res = mockRes()

		await login(req as unknown as Request, res as unknown as Response)

		expect(mockLogin).not.toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(400)
	})

	it('should 401 when AuthRoot.login returns undefined', async () =>
	{
		mockLogin.mockResolvedValue(undefined)

		const req = {
			body: { email: 'a@b.com', pass: 'pw' },
			getUser: () => undefined,
			getSession: () => ({ id: 'sid' }),
			setSession: vi.fn(),
		}
		const res = mockRes()

		await login(req as unknown as Request, res as unknown as Response)

		expect(res.status).toHaveBeenCalledWith(401)
	})

	it('should set session cookie and respond 204 on success', async () =>
	{
		const updated = {
			id: 'new-sid',
			expiresAt: new Date('2030-01-01T00:00:00Z'),
		}
		mockLogin.mockResolvedValue(updated)

		const setSession = vi.fn()
		const req = {
			body: { email: 'a@b.com', pass: 'pw' },
			getUser: () => undefined,
			getSession: () => ({ id: 'sid' }),
			setSession,
		}
		const res = mockRes()

		await login(req as unknown as Request, res as unknown as Response)

		expect(setSession).toHaveBeenCalledWith(updated)
		expect(res.cookie).toHaveBeenCalledWith('sid', 'new-sid', expect.any(Object))
		expect(res.status).toHaveBeenCalledWith(204)
	})
})
