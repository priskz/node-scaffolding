import { describe, it, expect } from 'vitest'
import { requestContext } from './request-context'

describe('requestContext', () =>
{
	it('should return undefined outside a request scope', () =>
	{
		const id = requestContext.getRequestId()
		expect(id).toBeUndefined()
	})

	it('should generate and return a requestId within a run scope', () =>
	{
		requestContext.run(() =>
		{
			const id = requestContext.getRequestId()
			expect(id).toBeDefined()
			expect(typeof id).toBe('string')
			expect(id!.length).toBeGreaterThan(0)
		})
	})

	it('should use a custom requestId when provided', () =>
	{
		const customId = 'test-request-123'

		requestContext.run(() =>
		{
			const id = requestContext.getRequestId()
			expect(id).toBe(customId)
		}, customId)
	})

	it('should isolate requestIds between nested runs', () =>
	{
		requestContext.run(() =>
		{
			const outerId = requestContext.getRequestId()

			requestContext.run(() =>
			{
				const innerId = requestContext.getRequestId()
				expect(innerId).not.toBe(outerId)
			})

			// Outer scope should retain its own requestId
			const afterId = requestContext.getRequestId()
			expect(afterId).toBe(outerId)
		})
	})

	it('should return the full store object', () =>
	{
		requestContext.run(() =>
		{
			const store = requestContext.getStore()
			expect(store).toBeDefined()
			expect(store!.requestId).toBeDefined()
		})
	})

	it('should return undefined store outside a run scope', () =>
	{
		const store = requestContext.getStore()
		expect(store).toBeUndefined()
	})
})
