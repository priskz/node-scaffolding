import { Router } from 'express'
import { route, RouteConfig } from '~/lib/util'
import { AuthApi } from '~/app/api'

// Init Auth Router
export const auth = Router()

// Base URI
const base = ''

// Config Routes
const routes: RouteConfig[] = [
	{
		path: '/login',
		method: 'post',
		handler: AuthApi.login
	},
	{
		path: '/register',
		method: 'post',
		handler: AuthApi.register
	}
]

// Register Routes
route.register(auth, routes, base)
