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
			req.should.have.property('context')
			req.should.have.property('setSession')
			req.should.have.property('getSession')
			req.should.have.property('getUser')
		})
	})
})
