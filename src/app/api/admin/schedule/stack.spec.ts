import { describe, it, expect, vi } from 'vitest'

const { mockList } = vi.hoisted(() => ({ mockList: vi.fn() }))

vi.mock('~/lib/util', () => ({
	respond: (_req: unknown, res: { status: (n: number) => unknown; json: (d: unknown) => unknown }) => ({
		success: (data?: unknown, code: number = 200) =>
		{
			res.status(code)
			res.json(data)
		},
	}),
	job: { list: mockList },
}))

import { stack } from './stack'
import type { Request, Response } from 'express'

describe('app/api/admin/schedule/stack', () =>
{
	it('should respond with job.list() (backward compatibility with schedule stack)', async () =>
	{
		const jobs = [{ name: 'x' }]
		mockList.mockReturnValue(jobs)

		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
		await stack({} as Request, res as unknown as Response)

		expect(res.json).toHaveBeenCalledWith(jobs)
	})
})
