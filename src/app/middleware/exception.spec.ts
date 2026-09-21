import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockLogWarn, mockLogError } = vi.hoisted(() => ({
	mockLogWarn: vi.fn(),
	mockLogError: vi.fn(),
}))

vi.mock('~/lib/util', async (importOriginal) =>
{
	const actual = await importOriginal<typeof import('~/lib/util')>()
	return {
		...actual,
		log: { warn: mockLogWarn, error: mockLogError },
		env: { DEBUG_MODE: false },
	}
})

import { exception } from './exception'
import { AppError } from '~/lib/error'
import type { Request, Response, NextFunction } from 'express'

function mockResponse(): Response
{
	const res: Partial<Response> = {
		status: vi.fn().mockReturnThis() as unknown as Response['status'],
		json: vi.fn().mockReturnThis() as unknown as Response['json'],
	}
	return res as Response
}

describe('app/middleware/exception', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	it('should respond with structured JSON for AppError (non-500)', async () =>
	{
		const res = mockResponse()
		const err = new AppError('Bad input', 400, 'BAD_INPUT')

		await exception(err, {} as Request, res, (() => {}) as NextFunction)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith(err.toJSON())
		expect(mockLogWarn).toHaveBeenCalled()
		expect(mockLogError).not.toHaveBeenCalled()
	})

	it('should log at error level for AppError with 5xx status', async () =>
	{
		const res = mockResponse()
		const err = new AppError('boom', 502, 'UPSTREAM')

		await exception(err, {} as Request, res, (() => {}) as NextFunction)

		expect(res.status).toHaveBeenCalledWith(502)
		expect(mockLogError).toHaveBeenCalled()
	})

	it('should respond with generic 500 for unstructured errors when DEBUG_MODE is off', async () =>
	{
		const res = mockResponse()
		const err = new Error('exploded')

		await exception(err, {} as Request, res, (() => {}) as NextFunction)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			code: 'INTERNAL_ERROR',
			message: 'Internal server error',
		})
		expect(mockLogError).toHaveBeenCalled()
	})
})
