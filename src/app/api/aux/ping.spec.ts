import { describe, it, expect, vi } from 'vitest'

vi.mock('~/lib/util', () => ({
	respond: (_req: unknown, res: { status: (n: number) => unknown; json: (d: unknown) => unknown }) => ({
		success: (data: unknown, code: number = 200) =>
		{
			res.status(code)
			res.json(data)
		},
	}),
}))

import { ping } from './ping'
import type { Request, Response } from 'express'

describe('app/api/aux/ping', () =>
{
	it('should respond with PONG', async () =>
	{
		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
		await ping({} as Request, res as unknown as Response)

		expect(res.json).toHaveBeenCalledWith('PONG')
	})
})
