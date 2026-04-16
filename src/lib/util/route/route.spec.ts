import { describe, it, expect, vi } from 'vitest'
import { route, RouteConfig } from './route'
import type { Router, RequestHandler } from 'express'

function mockRouter()
{
	const endpoint = {
		get: vi.fn().mockReturnThis(),
		post: vi.fn().mockReturnThis(),
		put: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
	}
	const router = {
		route: vi.fn(() => endpoint),
		__endpoint: endpoint,
	}
	return router as unknown as Router & { __endpoint: typeof endpoint }
}

describe('lib/util/route/register', () =>
{
	it('should register a single GET route with no middleware', () =>
	{
		const router = mockRouter()
		const handler: RequestHandler = (_req, _res, _next) => {}
		const config: RouteConfig = { method: 'get', path: '/ping', handler }

		route.register(router, config)

		expect(router.route).toHaveBeenCalledWith('/ping')
		expect((router as unknown as { __endpoint: { get: ReturnType<typeof vi.fn> } }).__endpoint.get)
			.toHaveBeenCalled()
	})

	it('should register an array of routes', () =>
	{
		const router = mockRouter()
		const handler: RequestHandler = (_req, _res, _next) => {}
		const routes: RouteConfig[] = [
			{ method: 'get', path: '/a', handler },
			{ method: 'post', path: '/b', handler },
		]

		route.register(router, routes)

		expect(router.route).toHaveBeenCalledWith('/a')
		expect(router.route).toHaveBeenCalledWith('/b')
	})

	it('should prefix each path with the base argument', () =>
	{
		const router = mockRouter()
		const handler: RequestHandler = (_req, _res, _next) => {}

		route.register(router, { method: 'get', path: '/users', handler }, '/api')

		expect(router.route).toHaveBeenCalledWith('/api/users')
	})

	it('should accept an array of middleware and register them', () =>
	{
		const router = mockRouter()
		const handler: RequestHandler = (_req, _res, _next) => {}
		const mw1: RequestHandler = (_req, _res, next) => { next() }
		const mw2: RequestHandler = (_req, _res, next) => { next() }

		route.register(router, { method: 'get', path: '/x', handler, middleware: [mw1, mw2] })

		const endpoint = (router as unknown as { __endpoint: { get: ReturnType<typeof vi.fn> } }).__endpoint
		expect(endpoint.get).toHaveBeenCalled()
		// Middleware array passed through — we just confirm 2 middleware were supplied.
		const args = endpoint.get.mock.calls[0]
		expect(Array.isArray(args[0])).toBe(true)
		expect(args[0]).toHaveLength(2)
	})

	it('should accept after-middleware as a third route.* argument', () =>
	{
		const router = mockRouter()
		const handler: RequestHandler = (_req, _res, _next) => {}
		const after: RequestHandler = (_req, _res, next) => { next() }

		route.register(router, { method: 'get', path: '/x', handler, after })

		const endpoint = (router as unknown as { __endpoint: { get: ReturnType<typeof vi.fn> } }).__endpoint
		const args = endpoint.get.mock.calls[0]
		// args: [middleware, handler, after]
		expect(Array.isArray(args[2])).toBe(true)
		expect(args[2]).toHaveLength(1)
	})
})
