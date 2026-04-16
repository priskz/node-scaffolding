import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Responder } from './Responder'
import type { Request, Response, NextFunction } from 'express'

function mockRes()
{
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		send: vi.fn().mockReturnThis(),
		setHeader: vi.fn().mockReturnThis(),
	}
	return res
}

describe('lib/util/respond/Responder', () =>
{
	let req: Request
	let res: ReturnType<typeof mockRes>
	let next: NextFunction

	beforeEach(() =>
	{
		req = {} as Request
		res = mockRes()
		next = vi.fn() as unknown as NextFunction
	})

	describe('success', () =>
	{
		it('should send 200 when data is provided', () =>
		{
			new Responder(req, res as unknown as Response).success({ ok: true })

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({ ok: true })
		})

		it('should flip 200 to 204 when no data is provided', () =>
		{
			new Responder(req, res as unknown as Response).success()

			expect(res.status).toHaveBeenCalledWith(204)
			expect(res.json).toHaveBeenCalledWith(undefined)
		})

		it('should respect an explicit non-200 success code even without data', () =>
		{
			new Responder(req, res as unknown as Response).success(undefined, 201)

			expect(res.status).toHaveBeenCalledWith(201)
		})

		it('should invoke next when configured', () =>
		{
			new Responder(req, res as unknown as Response, next).success({ ok: true })

			expect(next).toHaveBeenCalled()
		})
	})

	describe('error', () =>
	{
		it('should default to 400', () =>
		{
			new Responder(req, res as unknown as Response).error({ msg: 'bad' })

			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith({ msg: 'bad' })
		})

		it('should accept a custom error code', () =>
		{
			new Responder(req, res as unknown as Response).error('unauthorized', 401)

			expect(res.status).toHaveBeenCalledWith(401)
		})
	})

	describe('exception', () =>
	{
		it('should default to 500', () =>
		{
			new Responder(req, res as unknown as Response).exception('boom')

			expect(res.status).toHaveBeenCalledWith(500)
			expect(res.json).toHaveBeenCalledWith('boom')
		})
	})

	describe('redirect', () =>
	{
		it('should default to 302 and set Location', () =>
		{
			new Responder(req, res as unknown as Response).redirect('/somewhere')

			expect(res.setHeader).toHaveBeenCalledWith('Location', '/somewhere')
			expect(res.status).toHaveBeenCalledWith(302)
			expect(res.send).toHaveBeenCalled()
		})

		it('should use 301 when permanent=true', () =>
		{
			new Responder(req, res as unknown as Response).redirect('/perm', true)

			expect(res.status).toHaveBeenCalledWith(301)
		})

		it('should invoke next when configured', () =>
		{
			new Responder(req, res as unknown as Response, next).redirect('/x')

			expect(next).toHaveBeenCalled()
		})
	})
})
