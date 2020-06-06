import mocks from 'node-mocks-http'
import { respond, Responder } from './'

//----- Tests -----//

describe('util/respond', () => {
	describe('when called', () => {
		it('should return new instace of Responder', async () => {
			// Mocks
			const req = mocks.createRequest()
			const res = mocks.createResponse()

			// Test
			const responder = respond(req, res)

			// Assertions
			responder.should.be.an.instanceOf(Responder)
		})
	})
})
