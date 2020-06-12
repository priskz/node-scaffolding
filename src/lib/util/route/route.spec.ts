import { expect } from 'chai'
import { Router } from 'express'
import { route, RouteConfig } from './'

//----- Tests -----//

describe('util/route', () => {
	describe('when register is given individual RouteConfig', () => {
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
		it('should add route to the stack', async () => {
			expect(router.stack[0].route.path).to.equal(mockRouteConfig.path)
		})

		it('should make handler async', async () => {
			expect(router.stack[0].route.stack[0].handle.toString()).to.contain(
				'asyncUtilWrap'
			)
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
			expect(router.stack[0].route.path).to.equal(mockRouteConfig[0].path)
			expect(router.stack[1].route.path).to.equal(mockRouteConfig[1].path)
		})
	})

	describe('when register is given two (optional) middleware', () => {
		// Init router
		const router = Router()

		// Create route with middleare
		const mockRouteConfig: RouteConfig = {
			path: '/test-route-1',
			method: 'get',
			handler: () => {},
			middleware: [() => {}, () => {}]
		}

		// Test
		route.register(router, mockRouteConfig)

		// Assertions
		it('should add two layers to the route stack', async () => {
			// Assertions
			expect(router.stack[0].route.stack.length).to.equal(
				mockRouteConfig.middleware!.length + 1
			)
		})

		it('should make middleware async', async () => {
			expect(router.stack[0].route.stack[1].handle.toString()).to.contain(
				'asyncUtilWrap'
			)
		})
	})

	describe('when register is given two (optional) after (middleware)', () => {
		it('should add two layers to the route stack', async () => {
			// Init router
			const router = Router()

			// Create route with after middleware
			const mockRouteConfig: RouteConfig = {
				path: '/test-route-1',
				method: 'get',
				handler: () => {},
				after: [() => {}, () => {}]
			}

			// Test
			route.register(router, mockRouteConfig)

			// Assertions
			expect(router.stack[0].route.stack.length).to.equal(
				mockRouteConfig.after!.length + 1
			)
		})
	})

	describe('when register is given two (optional) middleware && two (optional) after middleware', () => {
		it('should add 4 layers to the route stack', async () => {
			// Init router
			const router = Router()

			// Create route w/ middleware/after
			const mockRouteConfig: RouteConfig = {
				path: '/test-route-1',
				method: 'get',
				handler: () => {},
				middleware: [() => {}, () => {}],
				after: [() => {}, () => {}]
			}

			// Test
			route.register(router, mockRouteConfig)

			// Assertions
			expect(router.stack[0].route.stack.length).to.equal(
				mockRouteConfig.middleware!.length + mockRouteConfig.after!.length + 1
			)
		})
	})

	describe('when register is given optional sync route', () => {
		it('should create the handler as standard function', async () => {
			// Init router
			const router = Router()

			// Create sync route
			const mockRouteConfig: RouteConfig = {
				path: '/test-route-1',
				method: 'get',
				handler: () => {},
				sync: true
			}

			// Test
			route.register(router, mockRouteConfig)

			// Test
			expect(router.stack[0].route.stack[0].handle.toString()).to.contain(
				'() => { }'
			)
		})
	})
})
