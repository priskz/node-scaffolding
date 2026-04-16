import { describe, it, expect, vi } from 'vitest'

vi.mock('~/lib/util', () => ({
	respond: (_req: unknown, res: { status: (n: number) => unknown; json: (d: unknown) => unknown }) => ({
		success: (data: unknown, code: number = 200) =>
		{
			res.status(code === 200 && data === undefined ? 204 : code)
			res.json(data)
		},
	}),
}))

vi.mock('~/config', () => ({
	config: { session: { cookie: 'sid' } },
}))

import { get } from './get'
import type { Request, Response } from 'express'

describe('app/api/session/get', () =>
{
	it('should return 204 when called with no data', async () =>
	{
		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
		await get({} as Request, res as unknown as Response)

		expect(res.status).toHaveBeenCalledWith(204)
	})
})
