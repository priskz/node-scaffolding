import { describe, it, expect, vi } from 'vitest'

const { mockClose } = vi.hoisted(() => ({ mockClose: vi.fn() }))

vi.mock('~/lib/util', () => ({
	respond: (_req: unknown, res: { status: (n: number) => unknown; json: (d: unknown) => unknown }) => ({
		success: (data?: unknown, code: number = 200) =>
		{
			res.status(code === 200 && data === undefined ? 204 : code)
			res.json(data)
		},
	}),
	job: { close: mockClose },
}))

import { stop } from './stop'
import type { Request, Response } from 'express'

describe('app/api/admin/schedule/stop', () =>
{
	it('should close the job service and respond 204', async () =>
	{
		mockClose.mockResolvedValue(undefined)

		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
		await stop({} as Request, res as unknown as Response)

		expect(mockClose).toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(204)
	})
})
