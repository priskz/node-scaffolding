import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'

//----- Tests -----//

describe.skip('app/api/session/get', () => {
	describe('cookie does not exist', () => {
		it('should return 204 with new session in cookie header', async () => {
			// Test
			const result: AxiosResponse = await appRequest.get('/session')

			// Assertions
			expect(result.status).equal(204)
		})
	})
})
