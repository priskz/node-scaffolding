import { Router } from 'express'
import { route, RouteConfig } from '~/lib/util'
import { SessionApi } from '~/app/api'
import { session as sessionMiddlware } from '~/app/middleware'

// Init Session Router
export const session = Router()

// Base URI
const base = ''

// Config Routes
const routes: RouteConfig[] = [
	{
		path: '/',
		method: 'get',
		handler: SessionApi.get,
		middleware: sessionMiddlware
	}
]

// Register Routes
route.register(session, routes, base)
