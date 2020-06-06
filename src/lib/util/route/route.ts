import { Router, RequestHandler } from 'express'
import asyncHandler from 'express-async-handler'

/*
 * Parse given request handlers into Async Middleware
 */
function _parseAsyncMiddleware(
	handler: RequestHandler | RequestHandler[] | undefined
): RequestHandler[] {
	// Wrapped middleware
	let middleware: RequestHandler[] = []

	// Middleware not defined?
	if (Array.isArray(handler)) {
		// Add single mw to var
		middleware = handler as RequestHandler[]
	}

	// Single middleware?
	if (handler && !Array.isArray(handler)) {
		middleware = [handler] as RequestHandler[]
	}

	// Convert all middleware to async, so exceptions are caught
	for (let x = 0; x < middleware.length; x++) {
		middleware[x] = asyncHandler(middleware[x])
	}

	// Return
	return middleware
}

/*
 * Parse given handler into async Handler
 */
function _parseHandler(handler: RequestHandler, sync = false): RequestHandler {
	// Async or sync?
	if (!sync) {
		// Convert to async
		handler = asyncHandler(handler)
	}

	return handler
}

/*
 * Register routes into the given router
 */
function register(
	router: Router,
	routes: RouteConfig[] | RouteConfig,
	base = ''
): void {
	// Convert single route to array
	if (!Array.isArray(routes)) {
		routes = [routes]
	}

	// Iterate routes
	for (let i = 0; i < routes.length; i++) {
		// Wrapped middleware
		let middleware = _parseAsyncMiddleware(routes[i].middleware)

		// Wrapped after middleware
		let after = _parseAsyncMiddleware(routes[i].after)

		// Wrapped after middleware
		let handler = _parseHandler(routes[i].handler, routes[i].sync)

		// Register route
		router
			.route(`${base}${routes[i].path}`)
			[routes[i].method](middleware, handler, after)
	}
}

/*
 * Export Util
 */
export const route: Route = {
	register
}

interface Route {
	register: (
		router: Router,
		routes: RouteConfig[] | RouteConfig,
		base?: string
	) => void
}

export interface RouteConfig {
	path: string
	method: 'get' | 'post' | 'put' | 'delete'
	handler: RequestHandler
	middleware?: RequestHandler | RequestHandler[] | undefined
	sync?: boolean
	after?: RequestHandler | RequestHandler[] | undefined
}
