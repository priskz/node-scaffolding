import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockUpdateSearchIndex } = vi.hoisted(() => ({
	mockUpdateSearchIndex: vi.fn(),
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

vi.mock('~/app/service/data', () => ({
	ContentService: class
	{
		public updateSearchIndex(id: string) { return mockUpdateSearchIndex(id) }
	},
}))

import { update } from './update'
import type { Request, Response } from 'express'

function mockRes()
{
	return {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	}
}

describe('app/api/search/update', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should error on invalid params', async () =>
	{
		const req = { params: { type: 'unknown', id: 'id1' } }
		const res = mockRes()

		await update(req as unknown as Request, res as unknown as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(mockUpdateSearchIndex).not.toHaveBeenCalled()
	})

	it('should respond 204 on successful content update', async () =>
	{
		mockUpdateSearchIndex.mockResolvedValue(true)

		const req = { params: { type: 'content', id: 'id1' } }
		const res = mockRes()

		await update(req as unknown as Request, res as unknown as Response)

		expect(mockUpdateSearchIndex).toHaveBeenCalledWith('id1')
		expect(res.status).toHaveBeenCalledWith(204)
	})

	it('should error when update returns false', async () =>
	{
		mockUpdateSearchIndex.mockResolvedValue(false)

		const req = { params: { type: 'content', id: 'id1' } }
		const res = mockRes()

		await update(req as unknown as Request, res as unknown as Response)

		expect(res.status).toHaveBeenCalledWith(400)
	})
})
