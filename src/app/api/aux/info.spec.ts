import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'

//----- Tests -----//

describe('api/aux/info', () => {
	describe('when GET request made', () => {
		it('should return 200', async () => {
			// Test
			const result: AxiosResponse = await appRequest.get('/info')

			// Assertions
			expect(result.status).to.equal(200)
			expect(result.data.name).equal('New App')
		})
	})
})
