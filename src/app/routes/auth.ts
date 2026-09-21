import { Router } from 'express'
import { route, RouteConfig } from '~/lib/util'
import { AuthApi } from '~/app/api'
import { authRateLimiter, session } from '~/app/middleware'

// Init Auth Router
export const auth = Router()

// Base URI
const base = ''

// Config Routes
const routes: RouteConfig[] = [
	{
		path: '/login',
		method: 'post',
		handler: AuthApi.login,
		middleware: [authRateLimiter, session]
	},
	{
		path: '/logout',
		method: 'post',
		handler: AuthApi.logout,
		middleware: session
	},
	{
		path: '/register',
		method: 'post',
		handler: AuthApi.register,
		middleware: [authRateLimiter, session]
	},
	{
		path: '/refresh',
		method: 'post',
		handler: AuthApi.refresh,
		middleware: authRateLimiter
	}
]

// Register Routes
route.register(auth, routes, base)
