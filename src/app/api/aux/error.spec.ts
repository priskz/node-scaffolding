import { describe, it, expect } from 'vitest'
import { error } from './error'
import type { Request, Response } from 'express'

describe('app/api/aux/error', () =>
{
	it('should throw with the supplied body message', async () =>
	{
		await expect(error({ body: { message: 'boom' } } as Request, {} as Response)).rejects.toThrow('boom')
	})

	it('should throw with default when no message provided', async () =>
	{
		await expect(error({ body: {} } as Request, {} as Response)).rejects.toThrow('/error api - No Message')
	})
})
