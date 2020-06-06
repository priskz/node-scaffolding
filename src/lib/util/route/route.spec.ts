import { Router } from 'express'
import { route, RouteConfig } from './'

//----- Tests -----//

describe('util/route', () => {
	describe('when register is given individual RouteConfig', () => {
		it('should add route to the stack', async () => {
			// Init router
			const router = Router()

			// Individual route
			const mockRouteConfig: RouteConfig = {
				path: '/test-route',
				method: 'get',
				handler: () => {}
			}

			// Test
			route.register(router, mockRouteConfig)

			// Assertions
			router.stack[0].route.path.should.equal(mockRouteConfig.path)
		})
	})

	describe('when register is given an an array of RouteConfigs', () => {
		it('should add all routes to the stack', async () => {
			// Init router
			const router = Router()

			// Several routes
			const mockRouteConfig: RouteConfig[] = [
				{
					path: '/test-route-1',
					method: 'get',
					handler: () => {}
				},
				{
					path: '/test-route-2',
					method: 'get',
					handler: () => {}
				}
			]

			// Test
			route.register(router, mockRouteConfig)

			// Assertions
			router.stack[0].route.path.should.equal(mockRouteConfig[0].path)
			router.stack[1].route.path.should.equal(mockRouteConfig[1].path)
		})
	})

	describe('More tests...', () => {
		it.skip('coming soon...')
	})
})
