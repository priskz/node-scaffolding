import { expect } from 'chai'
import mocks from 'node-mocks-http'
import { global } from './'

//----- Tests -----//

describe('middleware/global', () => {
	describe('when any request is made', () => {
		it('should define context properties on the request object', async () => {
			// Init request & response objects
			const req = mocks.createRequest()
			const res = mocks.createResponse()

			// Test
			await global(req, res, () => undefined)

			// Assertions
			expect(req).to.have.property('context')
			expect(req).to.have.property('setSession')
			expect(req).to.have.property('getSession')
			expect(req).to.have.property('getUser')
		})
	})

	describe('getSession function', () => {
		it('should return user object on session in context', async () => {
			// Init request & response objects
			const req = mocks.createRequest()
			const res = mocks.createResponse()

			// Run middleware
			await global(req, res, () => undefined)

			// Test
			const result = req.getSession()

			// Assertions
			expect(result).to.not.be.undefined
		})
	})

	describe('getUser function', () => {
		it('should return user object on session in context', async () => {
			// Init request & response objects
			const req = mocks.createRequest()
			const res = mocks.createResponse()

			// Run middleware
			await global(req, res, () => undefined)

			// Test
			const result = req.getUser()

			// Assertions
			expect(result).to.be.undefined
		})
	})
})
