import { describe, it, expect } from 'vitest'
import { respond } from './respond'
import { Responder } from './Responder'
import type { Request, Response } from 'express'

describe('lib/util/respond/respond', () =>
{
	it('should construct a Responder bound to req and res', () =>
	{
		const r = respond({} as Request, {} as Response)
		expect(r).toBeInstanceOf(Responder)
	})

	it('should accept an optional next function', () =>
	{
		const r = respond({} as Request, {} as Response, () => {})
		expect(r).toBeInstanceOf(Responder)
	})
})
