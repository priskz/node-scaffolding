import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRegister } = vi.hoisted(() => ({
	mockRegister: vi.fn(),
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

vi.mock('~/app/service', () => ({
	AuthRoot: class
	{
		public register(data: unknown) { return mockRegister(data) }
	},
}))

import { register } from './register'
import type { Request, Response } from 'express'

function mockRes()
{
	return {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	}
}

describe('app/api/auth/register', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should 400 on invalid input (bad email)', async () =>
	{
		const req = { body: { email: 'not-an-email', pass: 'abcdef' } }
		const res = mockRes()

		await register(req as unknown as Request, res as unknown as Response)

		expect(mockRegister).not.toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(400)
	})

	it('should 400 on invalid input (short password)', async () =>
	{
		const req = { body: { email: 'a@b.com', pass: '123' } }
		const res = mockRes()

		await register(req as unknown as Request, res as unknown as Response)

		expect(mockRegister).not.toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(400)
	})

	it('should 400 when registration fails (duplicate email)', async () =>
	{
		mockRegister.mockResolvedValue(undefined)

		const req = { body: { email: 'a@b.com', pass: 'abcdef' } }
		const res = mockRes()

		await register(req as unknown as Request, res as unknown as Response)

		expect(res.status).toHaveBeenCalledWith(400)
	})

	it('should respond 204 on successful registration', async () =>
	{
		mockRegister.mockResolvedValue({ id: 1, email: 'a@b.com' })

		const req = { body: { email: 'a@b.com', pass: 'abcdef' } }
		const res = mockRes()

		await register(req as unknown as Request, res as unknown as Response)

		expect(mockRegister).toHaveBeenCalledWith({ email: 'a@b.com', pass: 'abcdef' })
		expect(res.status).toHaveBeenCalledWith(204)
	})
})
