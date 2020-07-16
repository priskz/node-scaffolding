import { Router } from 'express'
import { route, RouteConfig } from '~/lib/util'
import { SearchApi } from '~/app/api'

// Init Search Router
export const search = Router()

// Base URI
const base = ''

// Config Routes
const routes: RouteConfig[] = [
	{
		path: '/:type',
		method: 'post',
		handler: SearchApi.get
	},
	{
		path: '/:type/:id',
		method: 'put',
		handler: SearchApi.update
	},
	{
		path: '/:index/refresh',
		method: 'post',
		handler: SearchApi.refresh
	}
]

// Register Routes
route.register(search, routes, base)
