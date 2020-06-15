import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'

//----- Tests -----//

describe('api/aux/ping', () => {
	describe('when GET request made', () => {
		it('should return 200', async () => {
			// Test
			const result: AxiosResponse = await appRequest.get('/ping')

			// Assertions
			expect(result.status).equal(200)
			expect(result.data).equal('PONG')
		})
	})
})
