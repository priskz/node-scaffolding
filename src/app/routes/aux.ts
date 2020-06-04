import { Router } from 'express'
import { route, RouteConfig } from '~/lib/util'
import { AuxApi } from '~/app/api'

// Init Root Router
export const aux = Router()

// Base URI
const base = ''

// Config Routes
const routes: RouteConfig[] = [
	{
		path: '/ping',
		method: 'get',
		handler: AuxApi.ping
	}
]

// Register Routes
route.register(aux, routes, base)
