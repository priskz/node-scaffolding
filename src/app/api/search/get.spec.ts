import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSearchFind } = vi.hoisted(() => ({
	mockSearchFind: vi.fn(),
}))

vi.mock('~/lib/util', () => ({
	log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
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

vi.mock('~/app/domain', () => ({
	ContentSearch: class
	{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		constructor(_opts?: any) {}
		public find(...args: unknown[]) { return mockSearchFind(...args) }
	},
}))

import { get, defaultFindQuery } from './get'
import type { Request, Response } from 'express'

function mockRes()
{
	return {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	}
}

describe('app/api/search/get — defaultFindQuery', () =>
{
	it('should build a weighted multi_match query', () =>
	{
		const q = defaultFindQuery('hello')
		expect(q).toEqual({
			query: {
				bool: {
					must: {
						multi_match: {
							type: 'best_fields',
							query: 'hello',
							fields: ['slug^3', 'title^3', 'subtitle^2', 'body'],
						},
					},
				},
			},
		})
	})
})

describe('app/api/search/get — controller', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should error on invalid params', async () =>
	{
		const req = {
			params: { type: 'invalid' },
			body: { text: 'anything' },
		}
		const res = mockRes()

		await get(req as unknown as Request, res as unknown as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(mockSearchFind).not.toHaveBeenCalled()
	})

	it('should error on invalid body (no raw or text)', async () =>
	{
		const req = {
			params: { type: 'content' },
			body: {},
		}
		const res = mockRes()

		await get(req as unknown as Request, res as unknown as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(mockSearchFind).not.toHaveBeenCalled()
	})

	it('should return 404 when no results found', async () =>
	{
		mockSearchFind.mockResolvedValue({ count: 0, maxScore: null, data: [] })

		const req = {
			params: { type: 'content' },
			body: { text: 'anything' },
		}
		const res = mockRes()

		await get(req as unknown as Request, res as unknown as Response)

		expect(res.status).toHaveBeenCalledWith(404)
	})

	it('should return results on match', async () =>
	{
		const result = { count: 2, maxScore: 1.5, data: [{ id: '1' }, { id: '2' }] }
		mockSearchFind.mockResolvedValue(result)

		const req = {
			params: { type: 'content' },
			body: { text: 'anything' },
		}
		const res = mockRes()

		await get(req as unknown as Request, res as unknown as Response)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(result)
	})

	it('should respond with 500 on search error', async () =>
	{
		mockSearchFind.mockRejectedValue(new Error('es-down'))

		const req = {
			params: { type: 'content' },
			body: { text: 'anything' },
		}
		const res = mockRes()

		await get(req as unknown as Request, res as unknown as Response)

		expect(res.status).toHaveBeenCalledWith(500)
	})
})
