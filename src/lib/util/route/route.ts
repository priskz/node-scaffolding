import { Router, RequestHandler } from 'express'
import asyncHandler from 'express-async-handler'

/*
 * Register routes into the given router
 */
function register(
	router: Router,
	routes: RouteConfig[] | RouteConfig,
	base: string = ''
): void {
	// Convert single route to array
	if (!Array.isArray(routes)) {
		routes = [routes]
	}

	// Iterate routes
	for (let i = 0; i < routes.length; i++) {
		// Wrapped middleware
		let middleware: RequestHandler[] = []

		// Middleware not defined?
		if (Array.isArray(routes[i].middleware)) {
			// Add single mw to var
			middleware = routes[i].middleware as RequestHandler[]
		}

		// Single middleware?
		if (routes[i].middleware && !Array.isArray(routes[i].middleware)) {
			middleware = [routes[i].middleware] as RequestHandler[]
		}

		// Convert all middleware to async, so any MW exceptions are caught
		for (let x = 0; x < middleware.length; x++) {
			middleware[x] = asyncHandler(middleware[x])
		}

		// Set route handler
		let handler = routes[i].handler

		// Async or sync?
		if (routes[i].sync !== true) {
			// Convert to async
			handler = asyncHandler(routes[i].handler)
		}

		// Register route
		router
			.route(`${base}${routes[i].path}`)
			[routes[i].method](middleware, handler)
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
		base: string
	) => void
}

export interface RouteConfig {
	path: string
	method: 'get' | 'post' | 'put' | 'delete'
	handler: RequestHandler
	middleware?: RequestHandler | RequestHandler[] | undefined
	sync?: boolean
}
