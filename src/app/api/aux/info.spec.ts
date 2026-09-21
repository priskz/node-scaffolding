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

import { info } from './info'
import type { Request, Response } from 'express'

describe('app/api/aux/info', () =>
{
	it('should respond with app name payload', async () =>
	{
		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
		await info({} as Request, res as unknown as Response)

		expect(res.json).toHaveBeenCalledWith({ name: 'New App' })
	})
})
