import { Router } from 'express'
import { route, RouteConfig } from '~/lib/util'
import { AuthApi } from '~/app/api'
import { session } from '~/app/middleware'

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
		middleware: session
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
		middleware: session
	}
]

// Register Routes
route.register(auth, routes, base)
