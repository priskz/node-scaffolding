import { describe, it, expect, vi } from 'vitest'
import { global as globalMiddleware } from './global'
import type { Request, Response, NextFunction } from 'express'

function mockRequest(): Request
{
	return {} as Request
}

describe('app/middleware/global', () =>
{
	it('should install context, setSession, getSession, getUser on the request', async () =>
	{
		const req = mockRequest()
		const res = {} as Response
		const next = vi.fn() as unknown as NextFunction

		await globalMiddleware(req, res, next)

		expect(typeof req.setSession).toBe('function')
		expect(typeof req.getSession).toBe('function')
		expect(typeof req.getUser).toBe('function')
		expect(next).toHaveBeenCalled()
	})

	it('should store session via setSession and retrieve via getSession', async () =>
	{
		const req = mockRequest()
		await globalMiddleware(req, {} as Response, (() => {}) as NextFunction)

		const session = { id: 'sid' } as never
		req.setSession(session)

		expect(req.getSession()).toBe(session)
	})

	it('should return undefined from getUser when no session set', async () =>
	{
		const req = mockRequest()
		await globalMiddleware(req, {} as Response, (() => {}) as NextFunction)

		expect(req.getUser()).toBeUndefined()
	})

	it('should expose user through getUser when session carries a user', async () =>
	{
		const req = mockRequest()
		await globalMiddleware(req, {} as Response, (() => {}) as NextFunction)

		const user = { id: 1, email: 'a@b.com' }
		// The getUser implementation dereferences session.user, so carry it on the session.
		req.setSession({ id: 'sid', user } as never)

		expect(req.getUser()).toEqual(user)
	})
})
