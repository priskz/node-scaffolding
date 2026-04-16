import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRefresh } = vi.hoisted(() => ({ mockRefresh: vi.fn() }))

vi.mock('~/lib/util', () => ({
	log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
	DefaultSearch: class
	{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		constructor(_opts?: any) {}
		public refresh() { return mockRefresh() }
	},
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
		exception: (data?: unknown, code: number = 500) =>
		{
			res.status(code)
			res.json(data)
		},
	}),
}))

vi.mock('~/config', () => ({
	config: { search: { index: { default: 'test-index' } } },
}))

import { refresh } from './refresh'
import type { Request, Response } from 'express'

function mockRes()
{
	return {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	}
}

describe('app/api/search/refresh', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should error on invalid params', async () =>
	{
		const req = { params: { index: 'bogus' } }
		const res = mockRes()

		await refresh(req as unknown as Request, res as unknown as Response)

		expect(res.status).toHaveBeenCalledWith(400)
	})

	it('should respond 204 when refresh succeeds', async () =>
	{
		mockRefresh.mockResolvedValue(true)

		const req = { params: { index: 'default' } }
		const res = mockRes()

		await refresh(req as unknown as Request, res as unknown as Response)

		expect(res.status).toHaveBeenCalledWith(204)
	})

	it('should respond 500 when refresh fails', async () =>
	{
		mockRefresh.mockResolvedValue(false)

		const req = { params: { index: 'default' } }
		const res = mockRes()

		await refresh(req as unknown as Request, res as unknown as Response)

		expect(res.status).toHaveBeenCalledWith(500)
	})
})
