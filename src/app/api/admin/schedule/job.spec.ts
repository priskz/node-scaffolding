import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'

//----- Tests -----//

describe('api/admin/schedule/job', () => {
	describe('GET request', () => {
		it('should return 200', async () => {
			// Test
			const result: AxiosResponse = await appRequest.get('/admin/schedule/job')

			// Assertions
			expect(result.status).to.equal(200)
		})
	})
})
