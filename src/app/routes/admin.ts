import { Router } from 'express'
import { AdminApi } from '~/app/api'
import { session } from '~/app/middleware'
import { route, RouteConfig } from '~/lib/util'

// Init Admin Router
export const admin = Router()

// Base URI
const base = ''

// Config Routes
const routes: RouteConfig[] = [
	{
		path: '/schedule/start',
		method: 'post',
		handler: AdminApi.ScheduleApi.start,
		middleware: session
	},
	{
		path: '/schedule/stop',
		method: 'post',
		handler: AdminApi.ScheduleApi.stop,
		middleware: session
	},
	{
		path: '/schedule/job',
		method: 'get',
		handler: AdminApi.ScheduleApi.job,
		middleware: session
	},
	{
		path: '/schedule/stack',
		method: 'get',
		handler: AdminApi.ScheduleApi.stack,
		middleware: session
	}
]

// Register Routes
route.register(admin, routes, base)
