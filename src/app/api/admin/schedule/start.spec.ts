import { describe, it, expect, vi } from 'vitest'

const { mockStart } = vi.hoisted(() => ({ mockStart: vi.fn() }))

vi.mock('~/lib/util', () => ({
	respond: (_req: unknown, res: { status: (n: number) => unknown; json: (d: unknown) => unknown }) => ({
		success: (data?: unknown, code: number = 200) =>
		{
			res.status(code === 200 && data === undefined ? 204 : code)
			res.json(data)
		},
	}),
	job: { start: mockStart },
}))

import { start } from './start'
import type { Request, Response } from 'express'

describe('app/api/admin/schedule/start', () =>
{
	it('should start the job service and respond 204', async () =>
	{
		mockStart.mockResolvedValue(undefined)

		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
		await start({} as Request, res as unknown as Response)

		expect(mockStart).toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(204)
	})
})
